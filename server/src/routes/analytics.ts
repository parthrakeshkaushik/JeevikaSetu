import { Router, Response } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { ROLES, REPORT_STATUS, LIVELIHOOD_CATEGORIES } from '../config.js';

const router = Router();

// GET /api/analytics/dashboard - Role-aware comprehensive analytics
router.get('/dashboard', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { district, block } = req.query;

    const baseWhere: any = {};

    // Jurisdiction Scoping
    if (user.role === ROLES.VOLUNTEER) {
      if (user.jurisdictionName) {
        baseWhere.panchayat = user.jurisdictionName;
      } else {
        baseWhere.assignedUserId = user.id;
      }
    } else if (user.role === ROLES.BDO) {
      if (user.jurisdictionName) {
        baseWhere.block = user.jurisdictionName;
      }
    } else if ([ROLES.DM, ROLES.ADM, ROLES.DDC, ROLES.DPO].includes(user.role as any)) {
      if (user.jurisdictionName) {
        baseWhere.district = user.jurisdictionName;
      }
    }

    // Override from query if permitted (e.g. DM drilling down into a block)
    if (district && district !== 'ALL') baseWhere.district = district as string;
    if (block && block !== 'ALL') baseWhere.block = block as string;

    // Fetch reports matching scope
    const allReports = await prisma.livelihoodReport.findMany({
      where: baseWhere,
      select: {
        id: true,
        reportNumber: true,
        citizenPhone: true,
        district: true,
        block: true,
        panchayat: true,
        village: true,
        status: true,
        livelihoodCategories: true,
        estimatedLossAmount: true,
        disruptionDurationDays: true,
        priorityLevel: true,
        priorityScore: true,
        isVoiceReport: true,
        assignedUserId: true,
        submittedAt: true,
        verifiedAt: true,
      },
    });

    const totalReports = allReports.length;

    // Deduplicated households (by citizenPhone + village)
    const householdSet = new Set(allReports.map((r) => `${r.citizenPhone}_${r.village.toLowerCase()}`));
    const uniqueHouseholdsCount = householdSet.size;

    // Status breakdown
    const statusCounts: Record<string, number> = {
      SUBMITTED: 0,
      AWAITING_REVIEW: 0,
      ASSIGNED_FOR_VERIFICATION: 0,
      VERIFICATION_IN_PROGRESS: 0,
      VERIFIED: 0,
      PARTIALLY_VERIFIED: 0,
      UNABLE_TO_VERIFY: 0,
      ADDITIONAL_INFO_REQUIRED: 0,
      REFERRED_FOR_RECOVERY: 0,
      FOLLOWUP_IN_PROGRESS: 0,
      ACTION_RECORDED: 0,
      CLOSED: 0,
      REOPENED: 0,
    };

    allReports.forEach((r) => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status]++;
      }
    });

    const pendingVerification =
      statusCounts.SUBMITTED +
      statusCounts.AWAITING_REVIEW +
      statusCounts.ASSIGNED_FOR_VERIFICATION +
      statusCounts.VERIFICATION_IN_PROGRESS;

    const totalVerified = statusCounts.VERIFIED + statusCounts.PARTIALLY_VERIFIED;
    const totalRecoveryReferred =
      statusCounts.REFERRED_FOR_RECOVERY +
      statusCounts.FOLLOWUP_IN_PROGRESS +
      statusCounts.ACTION_RECORDED;

    // Total self-reported estimated losses (explicitly unassessed)
    const totalSelfReportedLoss = allReports.reduce((sum, r) => sum + (r.estimatedLossAmount || 0), 0);

    // Aging & Overdue analysis (pending > 48 hours without verification)
    const now = new Date().getTime();
    let pendingUnder24h = 0;
    let pending24to48h = 0;
    let pendingOver48hOverdue = 0;

    allReports.forEach((r) => {
      const isPending = [
        REPORT_STATUS.SUBMITTED,
        REPORT_STATUS.AWAITING_REVIEW,
        REPORT_STATUS.ASSIGNED_FOR_VERIFICATION,
        REPORT_STATUS.VERIFICATION_IN_PROGRESS,
      ].includes(r.status as any);

      if (isPending) {
        const diffHours = (now - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) pendingUnder24h++;
        else if (diffHours < 48) pending24to48h++;
        else pendingOver48hOverdue++;
      }
    });

    // Livelihood Category distribution
    const categoryDistribution: Record<string, { count: number; nameHi: string; nameEn: string }> = {};
    LIVELIHOOD_CATEGORIES.forEach((c) => {
      categoryDistribution[c.id] = { count: 0, nameHi: c.nameHi, nameEn: c.nameEn };
    });

    allReports.forEach((r) => {
      try {
        const cats: string[] = JSON.parse(r.livelihoodCategories || '[]');
        cats.forEach((cat) => {
          if (categoryDistribution[cat]) {
            categoryDistribution[cat].count++;
          }
        });
      } catch (e) {}
    });

    const categoryChartData = Object.entries(categoryDistribution)
      .map(([key, val]) => ({
        category: key,
        name: val.nameHi.split(' ')[0],
        fullName: val.nameHi,
        count: val.count,
      }))
      .filter((d) => d.count > 0);

    // Block-wise distribution
    const blockDistribution: Record<string, { total: number; verified: number; pending: number }> = {};
    allReports.forEach((r) => {
      if (!blockDistribution[r.block]) {
        blockDistribution[r.block] = { total: 0, verified: 0, pending: 0 };
      }
      blockDistribution[r.block].total++;
      if (r.status === REPORT_STATUS.VERIFIED || r.status === REPORT_STATUS.PARTIALLY_VERIFIED) {
        blockDistribution[r.block].verified++;
      } else if (
        [
          REPORT_STATUS.SUBMITTED,
          REPORT_STATUS.AWAITING_REVIEW,
          REPORT_STATUS.ASSIGNED_FOR_VERIFICATION,
          REPORT_STATUS.VERIFICATION_IN_PROGRESS,
        ].includes(r.status as any)
      ) {
        blockDistribution[r.block].pending++;
      }
    });

    const blockChartData = Object.entries(blockDistribution).map(([blockName, data]) => ({
      block: blockName,
      total: data.total,
      verified: data.verified,
      pending: data.pending,
    }));

    // Priority breakdown
    const priorityCounts = {
      LOW: allReports.filter((r) => r.priorityLevel === 'LOW').length,
      MEDIUM: allReports.filter((r) => r.priorityLevel === 'MEDIUM').length,
      HIGH: allReports.filter((r) => r.priorityLevel === 'HIGH').length,
      URGENT: allReports.filter((r) => r.priorityLevel === 'URGENT').length,
    };

    // Voice vs Text adoption rate
    const voiceCount = allReports.filter((r) => r.isVoiceReport).length;
    const textCount = totalReports - voiceCount;

    // Escalations & Followups in scope
    const [totalEscalations, activeFollowUps] = await Promise.all([
      prisma.escalationRecord.count({
        where: {
          report: baseWhere,
          status: 'PENDING',
        },
      }),
      prisma.followUpAction.count({
        where: {
          report: baseWhere,
          status: 'IN_PROGRESS',
        },
      }),
    ]);

    res.json({
      success: true,
      role: user.role,
      scope: {
        district: user.jurisdictionName || 'All Authorized Districts',
        block: user.role === ROLES.BDO ? user.jurisdictionName : 'All Blocks',
      },
      kpis: {
        totalReports,
        uniqueHouseholdsCount,
        pendingVerification,
        totalVerified,
        totalRecoveryReferred,
        totalClosed: statusCounts.CLOSED,
        totalSelfReportedLoss,
        overdueCases: pendingOver48hOverdue,
        totalEscalations,
        activeFollowUps,
      },
      agingBreakdown: {
        under24h: pendingUnder24h,
        between24and48h: pending24to48h,
        over48hOverdue: pendingOver48hOverdue,
      },
      statusCounts,
      priorityCounts,
      categoryChartData,
      blockChartData,
      modality: {
        voiceReports: voiceCount,
        textReports: textCount,
        voicePercentage: totalReports > 0 ? Math.round((voiceCount / totalReports) * 100) : 0,
      },
      disclaimers: {
        lossAmountNote:
          'दर्शाया गया कुल अनुमानित नुकसान नागरिकों द्वारा स्व-रिपोर्ट किया गया है। यह आधिकारिक जांच या स्वीकृत मुआवजा नहीं है।',
        deduplicationNote:
          'अद्वितीय परिवारों की गणना मोबाइल नंबर और गांव के आधार पर की गई है ताकि दोहराव की पहचान हो सके।',
      },
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
