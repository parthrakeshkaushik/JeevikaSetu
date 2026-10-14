import { Router, Response } from 'express';
import prisma from '../db.js';
import { VerificationSubmissionSchema, AuthenticatedRequest } from '../types/index.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { ROLES, REPORT_STATUS } from '../config.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// POST /api/verification - Submit field verification observations
router.post(
  '/',
  authenticateToken,
  requireRoles(ROLES.VOLUNTEER, ROLES.BDO, ROLES.SYSTEM_ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const validated = VerificationSubmissionSchema.parse(req.body);

      const report = await prisma.livelihoodReport.findUnique({
        where: { id: validated.reportId },
      });

      if (!report) {
        res.status(404).json({ success: false, message: 'संबंधित रिपोर्ट नहीं मिली' });
        return;
      }

      // Check if volunteer is assigned to this report or in same jurisdiction
      if (user.role === ROLES.VOLUNTEER && report.assignedUserId && report.assignedUserId !== user.id) {
        res.status(403).json({
          success: false,
          message: 'यह रिपोर्ट आपके नाम आवंटित नहीं है। (Not assigned to you)',
        });
        return;
      }

      // Create VerificationRecord
      const verification = await prisma.verificationRecord.create({
        data: {
          reportId: validated.reportId,
          verifiedByUserId: user.id,
          verifiedRole: user.role,
          outcome: validated.outcome,
          fieldObservations: validated.fieldNotes,
          reasonForDecision: validated.reasonForDecision,
          recommendedAction: validated.recommendedAction || null,
          verifiedCropLossBigha: validated.verifiedCropLossBigha || null,
          verifiedCattleLost: validated.verifiedCattleLost || null,
          verifiedEquipmentLoss: validated.verifiedEquipmentLoss || null,
          photoEvidenceUrls: validated.photoEvidenceUrls ? JSON.stringify(validated.photoEvidenceUrls) : null,
        },
      });

      // Update case status to match verification outcome
      const newStatus = validated.outcome;
      await prisma.livelihoodReport.update({
        where: { id: validated.reportId },
        data: {
          status: newStatus,
          verifiedAt: new Date(),
        },
      });

      // Audit log
      await AuditService.logWorkflowEvent({
        reportId: validated.reportId,
        actorUserId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'VERIFY',
        fromStatus: report.status,
        toStatus: newStatus,
        remarks: `सत्यापन निष्कर्ष: ${validated.outcome}. कारण: ${validated.reasonForDecision}. फील्ड नोट्स: ${validated.fieldNotes}`,
        metadata: {
          verifiedCropLossBigha: validated.verifiedCropLossBigha,
          verifiedCattleLost: validated.verifiedCattleLost,
          recommendedAction: validated.recommendedAction,
        },
      });

      res.status(201).json({
        success: true,
        message: 'क्षेत्र सत्यापन सफलतापूर्वक दर्ज कर लिया गया। (Field verification submitted)',
        verification,
      });
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/verification/:reportId - Get verification records for a report
router.get(
  '/:reportId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reportId } = req.params;
      const verifications = await prisma.verificationRecord.findMany({
        where: { reportId },
        include: {
          verifiedByUser: {
            select: { id: true, fullName: true, role: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, verifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
