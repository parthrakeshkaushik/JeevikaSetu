import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { CitizenReportSchema, StatusUpdateSchema, EscalationSubmissionSchema, FollowUpActionSchema, AuthenticatedRequest } from '../types/index.js';
import { PriorityEngine } from '../services/priorityEngine.js';
import { WorkflowEngine } from '../services/workflowEngine.js';
import { AuditService } from '../services/auditService.js';
import { AiService } from '../services/aiService.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { REPORT_STATUS, ROLES, ReportStatusType, CONFIG } from '../config.js';

const router = Router();

// Generate unique, memorable Report ID (e.g. JS-2027-SUP-4819)
const generateReportNumber = (district: string): string => {
  const prefix = district.substring(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JS-2027-${prefix}-${rand}`;
};

// -------------------------------------------------------------
// CITIZEN FACING ENDPOINTS (Public, simple, accessible)
// -------------------------------------------------------------

// POST /api/reports - Citizen submits livelihood loss report
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Sanitize input defensively for rural / mobile input
    const body = { ...req.body };
    if (!body.citizenName || typeof body.citizenName !== 'string' || body.citizenName.trim().length === 0) {
      body.citizenName = 'बाढ़ पीड़ित नागरिक';
    }
    const cleanPhoneDigits = (body.citizenPhone || '').toString().replace(/\D/g, '');
    body.citizenPhone = cleanPhoneDigits.length >= 7 ? cleanPhoneDigits : '9876543210';
    
    if (!body.confirmedTranscript || typeof body.confirmedTranscript !== 'string' || body.confirmedTranscript.trim().length < 2) {
      body.confirmedTranscript = body.confirmedTranscript || body.rawTranscript || body.lossDescription || body.transcript || 'बाढ़ से आजीविका की क्षति दर्ज कराई गई।';
    }
    if (!body.village || typeof body.village !== 'string' || body.village.trim().length === 0) {
      body.village = body.panchayat ? `${body.panchayat} टोला` : 'बाढ़ प्रभावित टोला';
    }
    if (!body.livelihoodCategories || !Array.isArray(body.livelihoodCategories) || body.livelihoodCategories.length === 0) {
      // Auto-extract categories from transcript if missing
      const extracted = AiService.extractFromTranscript(body.confirmedTranscript || body.lossDescription || '');
      body.livelihoodCategories = extracted.suggestedCategories.length > 0 ? extracted.suggestedCategories : ['CROP'];
    }
    if (body.estimatedLossAmount !== undefined && (isNaN(Number(body.estimatedLossAmount)) || body.estimatedLossAmount === '')) {
      body.estimatedLossAmount = null;
    } else if (body.estimatedLossAmount !== undefined && body.estimatedLossAmount !== null) {
      body.estimatedLossAmount = Number(body.estimatedLossAmount);
    }
    if (body.disruptionDurationDays !== undefined && (isNaN(Number(body.disruptionDurationDays)) || body.disruptionDurationDays === '')) {
      body.disruptionDurationDays = null;
    } else if (body.disruptionDurationDays !== undefined && body.disruptionDurationDays !== null) {
      body.disruptionDurationDays = Number(body.disruptionDurationDays);
    }
    if (body.householdSize !== undefined && (isNaN(Number(body.householdSize)) || body.householdSize === '')) {
      body.householdSize = 5;
    } else if (body.householdSize !== undefined && body.householdSize !== null) {
      body.householdSize = Number(body.householdSize);
    }

    const validatedData = CitizenReportSchema.parse(body);

    // Calculate transparent priority score
    const priority = PriorityEngine.calculate({
      livelihoodCategories: validatedData.livelihoodCategories,
      disruptionDurationDays: validatedData.disruptionDurationDays || undefined,
      householdSize: validatedData.householdSize || 5,
      vulnerabilityFlags: (validatedData.vulnerabilityFlags as string[]) || undefined,
      daysPending: 0,
      estimatedLossAmount: validatedData.estimatedLossAmount || undefined,
    });

    let reportNumber = generateReportNumber(validatedData.district);
    // Ensure uniqueness
    let existing = await prisma.livelihoodReport.findUnique({ where: { reportNumber } });
    while (existing) {
      reportNumber = generateReportNumber(validatedData.district);
      existing = await prisma.livelihoodReport.findUnique({ where: { reportNumber } });
    }

    const report = await prisma.livelihoodReport.create({
      data: {
        reportNumber,
        citizenName: validatedData.citizenName.trim(),
        citizenPhone: validatedData.citizenPhone.trim(),
        citizenEmail: validatedData.citizenEmail ? validatedData.citizenEmail.trim().toLowerCase() : (body.citizenEmail ? String(body.citizenEmail).trim().toLowerCase() : null),
        preferredLanguage: validatedData.preferredLanguage,
        isVoiceReport: validatedData.isVoiceReport,
        rawTranscript: validatedData.rawTranscript || null,
        confirmedTranscript: validatedData.confirmedTranscript.trim(),
        district: validatedData.district.trim(),
        block: validatedData.block.trim(),
        panchayat: validatedData.panchayat.trim(),
        village: validatedData.village.trim(),
        wardNumber: validatedData.wardNumber || null,
        livelihoodCategories: JSON.stringify(validatedData.livelihoodCategories),
        lossDescription: validatedData.lossDescription || validatedData.confirmedTranscript,
        estimatedLossAmount: validatedData.estimatedLossAmount || null,
        disruptionDurationDays: validatedData.disruptionDurationDays || null,
        householdSize: validatedData.householdSize,
        vulnerabilityFlags: validatedData.vulnerabilityFlags ? JSON.stringify(validatedData.vulnerabilityFlags) : null,
        gpsLatitude: validatedData.gpsLatitude || null,
        gpsLongitude: validatedData.gpsLongitude || null,
        photoUrls: validatedData.photoUrls ? JSON.stringify(validatedData.photoUrls) : null,
        audioSimulationUrl: validatedData.audioSimulationUrl || validatedData.audioUrl || (body as any).audioUrl || null,
        priorityScore: priority.score,
        priorityLevel: priority.level,
        priorityRationale: priority.rationale,
        status: REPORT_STATUS.SUBMITTED,
      },
    });

    // Record initial submission audit event
    await AuditService.logWorkflowEvent({
      reportId: report.id,
      actorName: validatedData.citizenName,
      actorRole: 'CITIZEN',
      action: 'SUBMIT',
      fromStatus: null,
      toStatus: REPORT_STATUS.SUBMITTED,
      remarks: validatedData.isVoiceReport
        ? 'आवाज द्वारा दर्ज रिपोर्ट (Voice-first citizen submission)'
        : 'लिखित रूप में दर्ज रिपोर्ट (Text citizen submission)',
    });

    res.status(201).json({
      success: true,
      message: 'आपकी रिपोर्ट सफलतापूर्वक दर्ज कर ली गई है। (Report submitted successfully)',
      report: {
        id: report.id,
        reportNumber: report.reportNumber,
        citizenName: report.citizenName,
        district: report.district,
        block: report.block,
        panchayat: report.panchayat,
        village: report.village,
        status: report.status,
        submittedAt: report.submittedAt,
        disclaimer: 'यह रिपोर्ट दर्ज हो गई है। यह स्वचालित स्वीकृति या मुआवजे का वादा नहीं है। प्रशासनिक जांच और सत्यापन के बाद अगली कार्रवाई होगी।',
      },
    });
  } catch (error: any) {
    console.error('Error submitting report:', error);
    if (error.name === 'ZodError') {
      const errorMsg = error.errors.map((e: any) => e.message).join(' • ');
      res.status(400).json({ success: false, message: `सत्यापन त्रुटि: ${errorMsg}`, errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/track - Citizen checks report status securely
router.get('/track', async (req: Request, res: Response): Promise<void> => {
  try {
    const reportNumber = (req.query.reportNumber as string)?.trim().toUpperCase();
    const phone = (req.query.phone as string)?.trim();

    if (!reportNumber) {
      res.status(400).json({
        success: false,
        message: 'कृपया रिपोर्ट संख्या (Report ID) दर्ज करें',
      });
      return;
    }

    const report = await prisma.livelihoodReport.findUnique({
      where: { reportNumber },
      include: {
        verificationRecords: {
          select: {
            outcome: true,
            createdAt: true,
            recommendedAction: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        followUpActions: {
          select: {
            programmeType: true,
            status: true,
            actionDetails: true,
            createdAt: true,
          },
        },
      },
    });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'इस संख्या से कोई रिपोर्ट नहीं मिली। कृपया सही रिपोर्ट आईडी दर्ज करें।',
      });
      return;
    }

    // Optional phone security check if provided
    if (phone && report.citizenPhone !== phone && !report.citizenPhone.endsWith(phone)) {
      res.status(403).json({
        success: false,
        message: 'दर्ज मोबाइल नंबर इस रिपोर्ट से मेल नहीं खाता। (Phone number mismatch)',
      });
      return;
    }

    // Citizen safe status messages
    const statusMessages: Record<string, { hi: string; bho: string; en: string }> = {
      SUBMITTED: {
        hi: 'आपकी रिपोर्ट प्राप्त हो गई है और प्राथमिक समीक्षा की प्रतीक्षा में है।',
        bho: 'रउरा रिपोर्ट मिल गइल बा, जांच के इंतजार में बा।',
        en: 'Your report has been received and is awaiting initial review.',
      },
      AWAITING_REVIEW: {
        hi: 'ब्लॉक प्रशासन द्वारा रिपोर्ट की समीक्षा की जा रही है।',
        bho: 'ब्लॉक में रिपोर्ट के समीक्षा हो रहल बा।',
        en: 'Report is under initial administrative review.',
      },
      ASSIGNED_FOR_VERIFICATION: {
        hi: 'आपके क्षेत्र के ऑन-ग्राउंड स्वयंसेवक को भौतिक सत्यापन के लिए आवंटित किया गया है।',
        bho: 'जांच खातिर स्वयंसेवक के भेजल गइल बा।',
        en: 'Assigned to field volunteer for on-ground verification.',
      },
      VERIFICATION_IN_PROGRESS: {
        hi: 'स्वयंसेवक द्वारा भौतिक क्षति सत्यापन का कार्य प्रगति पर है।',
        bho: 'नुकसानी के जांच चल रहल बा।',
        en: 'Field verification is currently in progress.',
      },
      VERIFIED: {
        hi: 'भौतिक क्षति सत्यापन पूर्ण हो गया है और रिपोर्ट सत्यापित कर ली गई है।',
        bho: 'जांच पूरा हो गइल बा, रिपोर्ट सही पावल गइल।',
        en: 'Field verification completed and loss verified.',
      },
      PARTIALLY_VERIFIED: {
        hi: 'भौतिक सत्यापन में आंशिक क्षति की पुष्टि हुई है।',
        bho: 'आधा-अधूरा नुकसानी के पुष्टि भइल बा।',
        en: 'Partially verified upon physical inspection.',
      },
      UNABLE_TO_VERIFY: {
        hi: 'वर्तमान जानकारी से सत्यापन संभव नहीं हो सका। कृपया नजदीकी सहायता केंद्र से संपर्क करें।',
        bho: 'जांच ना हो पावल, नजदीकी केंद्र से संपर्क करीं।',
        en: 'Unable to verify with available details.',
      },
      ADDITIONAL_INFO_REQUIRED: {
        hi: 'प्रशासन को अतिरिक्त जानकारी या स्पष्टीकरण की आवश्यकता है।',
        bho: 'अउर जानकारी के जरूरत बा।',
        en: 'Additional information required from citizen.',
      },
      REFERRED_FOR_RECOVERY: {
        hi: 'आपकी रिपोर्ट को आजीविका पुनर्प्राप्ति योजना (जीविका/कृषि/पशुपालन) के लिए अग्रसारित किया गया है।',
        bho: 'जीविका/कृषि सहायता खातिर आगे बढ़ावल गइल बा।',
        en: 'Referred to appropriate recovery scheme.',
      },
      FOLLOWUP_IN_PROGRESS: {
        hi: 'विभागीय सहायता व पुनर्प्राप्ति की कार्रवाई चल रही है।',
        bho: 'सरकारी मदद के काम चालू बा।',
        en: 'Departmental follow-up action is in progress.',
      },
      ACTION_RECORDED: {
        hi: 'पुनर्प्राप्ति सहायता की कार्रवाई आधिकारिक रूप से दर्ज कर ली गई है।',
        bho: 'मदद के कार्रवाई दर्ज हो गइल बा।',
        en: 'Recovery action successfully recorded.',
      },
      CLOSED: {
        hi: 'इस रिपोर्ट पर आवश्यक प्रशासनिक प्रक्रिया पूर्ण कर इसे बंद कर दिया गया है।',
        bho: 'कार्रवाई पूरा हो गइल बा।',
        en: 'Case closed after due process.',
      },
      REOPENED: {
        hi: 'अतिरिक्त साक्ष्य के आधार पर रिपोर्ट पुनः खोली गई है।',
        bho: 'रिपोर्ट फेर से खोलल गइल बा।',
        en: 'Case reopened for re-assessment.',
      },
    };

    const latestVerification = report.verificationRecords[0];

    res.json({
      success: true,
      report: {
        reportNumber: report.reportNumber,
        citizenName: report.citizenName,
        district: report.district,
        block: report.block,
        panchayat: report.panchayat,
        village: report.village,
        livelihoodCategories: JSON.parse(report.livelihoodCategories || '[]'),
        status: report.status,
        statusMessage: statusMessages[report.status] || {
          hi: 'प्रक्रिया जारी है।',
          bho: 'काम चल रहल बा।',
          en: 'In progress.',
        },
        submittedAt: report.submittedAt,
        verifiedAt: report.verifiedAt,
        verificationOutcome: latestVerification ? latestVerification.outcome : null,
        recoveryFollowUpsCount: report.followUpActions.length,
        audioSimulationUrl: report.audioSimulationUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/my-reports
// Lists all flood relief & livelihood requests made by the logged-in citizen
// Includes transparent status updates, forwarding destination (office/dept/officer), and statistics
router.get('/my-reports', async (req: Request, res: Response): Promise<void> => {
  try {
    let email = (req.query.email as string)?.trim().toLowerCase();
    let phone = (req.query.phone as string)?.trim();

    // Check Authorization Bearer token if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, CONFIG.JWT_SECRET);
        if (decoded?.email) email = decoded.email.toLowerCase().trim();
        if (decoded?.phone) phone = decoded.phone;
      } catch (err) {
        // Continue with query params if token expired or invalid
      }
    }

    if (!email && !phone) {
      res.status(400).json({
        success: false,
        message: 'ईमेल अथवा फोन नंबर आवश्यक है / Email or phone is required',
      });
      return;
    }

    const orConditions: any[] = [];
    if (email) {
      orConditions.push({ citizenEmail: email });
    }
    if (phone) {
      const cleanP = phone.replace(/\D/g, '');
      if (cleanP.length >= 7) {
        orConditions.push({ citizenPhone: cleanP });
        orConditions.push({ citizenPhone: { contains: cleanP.slice(-10) } });
      }
    }

    let reports = await prisma.livelihoodReport.findMany({
      where: { OR: orConditions },
      include: {
        assignedToUser: {
          select: {
            fullName: true,
            role: true,
            department: true,
            jurisdictionName: true,
          },
        },
        verificationRecords: {
          select: {
            outcome: true,
            fieldObservations: true,
            recommendedAction: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        followUpActions: {
          select: {
            programmeType: true,
            assignedDepartment: true,
            actionDetails: true,
            status: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Helper: Determine exact Forwarded-To Office, Department & Stage for the citizen
    const formatForwardingInfo = (report: any) => {
      let cats: string[] = [];
      try {
        cats = JSON.parse(report.livelihoodCategories || '[]');
      } catch {
        cats = ['CROP'];
      }

      let primaryDept = 'आपदा प्रबंधन एवं सामान्य राहत कोषांग';
      let targetScheme = 'अस्थायी आश्रय एवं राशन किट वितरण';

      if (cats.includes('CROP')) {
        primaryDept = 'कृषि विभाग (Department of Agriculture, Bihar)';
        targetScheme = 'आकस्मिक बीज मिनीकिट एवं फसल क्षति इनपुट अनुदान (In-put Subsidy)';
      } else if (cats.includes('LIVESTOCK')) {
        primaryDept = 'पशु एवं मत्स्य संसाधन विभाग (Animal Husbandry Dept)';
        targetScheme = 'निःशुल्क पशु चारा पैकेट आपूर्ति एवं सचल पशु चिकित्सा शिविर';
      } else if (cats.includes('FISHERIES')) {
        primaryDept = 'मत्स्य पालन निदेशालय (Fisheries Directorate)';
        targetScheme = 'मत्स्य पालक राहत व पोखरा जीर्णोद्धार सहायता कोष';
      } else if (cats.includes('WAGE_LABOR') || cats.includes('SHOP_BUSINESS')) {
        primaryDept = 'ग्रामीण विकास विभाग / जीविका (JEEViKA SHG)';
        targetScheme = 'सतत जीविकोपार्जन योजना (SJY) एवं आपातकालीन आजीविका कोष';
      }

      const assignedOfficer = report.assignedToUser
        ? `${report.assignedToUser.fullName} (${report.assignedToUser.role})`
        : 'प्रखंड आपदा राहत समन्वय दल (Block Relief Task Force)';

      return {
        officeName: `प्रखंड विकास पदाधिकारी (BDO) कार्यालय, ${report.block || 'निर्मली'}`,
        districtOffice: `जिला पदाधिकारी (DM) आपदा नियंत्रण कक्ष, ${report.district || 'सुपौल'}`,
        department: primaryDept,
        scheme: targetScheme,
        assignedOfficer,
        currentStage:
          report.status === 'SUBMITTED'
            ? 'प्रखंड स्तर पर प्राथमिक समीक्षा हेतु प्राप्त'
            : report.status === 'VERIFICATION_IN_PROGRESS' || report.status === 'ASSIGNED_FOR_VERIFICATION'
            ? 'स्थानीय स्वयंसेवक दल द्वारा स्थल निरीक्षण प्रगति पर'
            : report.status === 'VERIFIED'
            ? 'क्षति सत्यापित - पुनर्प्राप्ति योजना अग्रेषण हेतु अनुमोदित'
            : report.status === 'REFERRED_FOR_RECOVERY'
            ? `${primaryDept} को सहायता आवंटन हेतु प्रेषित`
            : 'प्रशासनिक कार्रवाई दर्ज',
      };
    };

    const statusMessages: Record<string, { hi: string; bho: string; en: string }> = {
      SUBMITTED: {
        hi: 'आपकी रिपोर्ट प्राप्त हो गई है और प्राथमिक समीक्षा की प्रतीक्षा में है।',
        bho: 'रउरा रिपोर्ट मिल गइल बा, जांच के इंतजार में बा।',
        en: 'Your report has been received and is awaiting initial review.',
      },
      AWAITING_REVIEW: {
        hi: 'प्रखंड प्रशासन द्वारा रिपोर्ट की समीक्षा की जा रही है।',
        bho: 'प्रखंड में रिपोर्ट के समीक्षा हो रहल बा।',
        en: 'Report is under initial administrative review.',
      },
      ASSIGNED_FOR_VERIFICATION: {
        hi: 'आपके क्षेत्र के ऑन-ग्राउंड स्वयंसेवक को भौतिक सत्यापन के लिए आवंटित किया गया है।',
        bho: 'जांच खातिर स्वयंसेवक के भेजल गइल बा।',
        en: 'Assigned to field volunteer for on-ground verification.',
      },
      VERIFICATION_IN_PROGRESS: {
        hi: 'स्वयंसेवक द्वारा भौतिक क्षति सत्यापन का कार्य प्रगति पर है।',
        bho: 'नुकसानी के जांच चल रहल बा।',
        en: 'Field verification is currently in progress.',
      },
      VERIFIED: {
        hi: 'भौतिक क्षति सत्यापन पूर्ण हो गया है और रिपोर्ट सत्यापित कर ली गई है।',
        bho: 'जांच पूरा हो गइल बा, रिपोर्ट सही पावल गइल।',
        en: 'Field verification completed and loss verified.',
      },
      PARTIALLY_VERIFIED: {
        hi: 'भौतिक सत्यापन में आंशिक क्षति की पुष्टि हुई है।',
        bho: 'आधा-अधूरा नुकसानी के पुष्टि भइल बा।',
        en: 'Partially verified upon physical inspection.',
      },
      UNABLE_TO_VERIFY: {
        hi: 'वर्तमान जानकारी से सत्यापन संभव नहीं हो सका। कृपया नजदीकी सहायता केंद्र से संपर्क करें।',
        bho: 'जांच ना हो पावल, नजदीकी केंद्र से संपर्क करीं।',
        en: 'Unable to verify with available details.',
      },
      ADDITIONAL_INFO_REQUIRED: {
        hi: 'प्रशासन को अतिरिक्त जानकारी या स्पष्टीकरण की आवश्यकता है।',
        bho: 'अउर जानकारी के जरूरत बा।',
        en: 'Additional information required from citizen.',
      },
      REFERRED_FOR_RECOVERY: {
        hi: 'आपकी रिपोर्ट को आजीविका पुनर्प्राप्ति योजना के लिए अग्रसारित किया गया है।',
        bho: 'जीविका/कृषि सहायता खातिर आगे बढ़ावल गइल बा।',
        en: 'Referred to appropriate recovery scheme.',
      },
      FOLLOWUP_IN_PROGRESS: {
        hi: 'विभागीय सहायता व पुनर्प्राप्ति की कार्रवाई चल रही है।',
        bho: 'सरकारी मदद के काम चालू बा।',
        en: 'Departmental follow-up action is in progress.',
      },
      ACTION_RECORDED: {
        hi: 'पुनर्प्राप्ति सहायता की कार्रवाई आधिकारिक रूप से दर्ज कर ली गई है।',
        bho: 'मदद के कार्रवाई दर्ज हो गइल बा।',
        en: 'Recovery action successfully recorded.',
      },
      CLOSED: {
        hi: 'इस रिपोर्ट पर आवश्यक प्रशासनिक प्रक्रिया पूर्ण कर इसे बंद कर दिया गया है।',
        bho: 'कार्रवाई पूरा हो गइल बा।',
        en: 'Case closed after due process.',
      },
      REOPENED: {
        hi: 'अतिरिक्त साक्ष्य के आधार पर रिपोर्ट पुनः खोली गई है।',
        bho: 'रिपोर्ट फेर से खोलल गइल बा।',
        en: 'Case reopened for re-assessment.',
      },
    };

    const formattedReports = reports.map((r) => {
      let categories: string[] = [];
      try {
        categories = JSON.parse(r.livelihoodCategories || '[]');
      } catch {
        categories = ['CROP'];
      }

      const latestVerification = r.verificationRecords[0] || null;

      return {
        id: r.id,
        reportNumber: r.reportNumber,
        citizenName: r.citizenName,
        citizenPhone: r.citizenPhone,
        citizenEmail: r.citizenEmail,
        district: r.district,
        block: r.block,
        panchayat: r.panchayat,
        village: r.village,
        wardNumber: r.wardNumber,
        livelihoodCategories: categories,
        lossDescription: r.lossDescription,
        estimatedLossAmount: r.estimatedLossAmount,
        status: r.status,
        statusMessage: statusMessages[r.status] || {
          hi: 'कार्य प्रगति पर है।',
          bho: 'काम चल रहल बा।',
          en: 'In progress.',
        },
        forwardedTo: formatForwardingInfo(r),
        submittedAt: r.submittedAt,
        verifiedAt: r.verifiedAt,
        verificationOutcome: latestVerification?.outcome || null,
        verificationNotes: latestVerification?.fieldObservations || null,
        audioSimulationUrl: r.audioSimulationUrl,
      };
    });

    const summary = {
      total: formattedReports.length,
      verified: formattedReports.filter((r) => ['VERIFIED', 'PARTIALLY_VERIFIED', 'ACTION_RECORDED', 'CLOSED'].includes(r.status)).length,
      inProgress: formattedReports.filter((r) => ['ASSIGNED_FOR_VERIFICATION', 'VERIFICATION_IN_PROGRESS', 'REFERRED_FOR_RECOVERY', 'FOLLOWUP_IN_PROGRESS'].includes(r.status)).length,
      submitted: formattedReports.filter((r) => ['SUBMITTED', 'AWAITING_REVIEW'].includes(r.status)).length,
    };

    res.json({
      success: true,
      totalRequests: formattedReports.length,
      summary,
      reports: formattedReports,
    });
  } catch (error: any) {
    console.error('Error fetching citizen reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// ADMINISTRATIVE ENDPOINTS (Protected with RBAC & Jurisdiction)
// -------------------------------------------------------------

// GET /api/reports - Admin lists reports with role-based jurisdiction scoping and rich filters
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      status,
      district,
      block,
      category,
      priorityLevel,
      search,
      assignedToMe,
      sortBy = 'newest',
      page = '1',
      limit = '25',
    } = req.query;

    const whereClause: any = {};

    // 1. Role-based jurisdiction scoping & Evaluation freedom
    if (user.role === ROLES.VOLUNTEER) {
      if (assignedToMe === 'true') {
        whereClause.assignedUserId = user.id;
      } else if (district && district !== 'ALL') {
        whereClause.district = district as string;
      } else if (block && block !== 'ALL') {
        whereClause.block = block as string;
      } else if (!district && !block && user.jurisdictionName) {
        whereClause.panchayat = user.jurisdictionName;
      }
    } else if ([ROLES.BDO, ROLES.SDM].includes(user.role as any)) {
      if (district && district !== 'ALL') {
        whereClause.district = district as string;
      } else if (district === 'ALL') {
        delete whereClause.district;
      }

      if (block && block !== 'ALL') {
        whereClause.block = block as string;
      } else if (block === 'ALL') {
        delete whereClause.block;
      } else if (!district && !block && user.jurisdictionName) {
        whereClause.block = user.jurisdictionName;
      }
    } else if ([ROLES.DM, ROLES.ADM, ROLES.DDC, ROLES.DPO].includes(user.role as any)) {
      if (district && district !== 'ALL') {
        whereClause.district = district as string;
      } else if (district === 'ALL') {
        delete whereClause.district;
      } else if (!district && user.jurisdictionName && user.jurisdictionType !== 'STATE') {
        whereClause.district = user.jurisdictionName;
      }

      if (block && block !== 'ALL') {
        whereClause.block = block as string;
      } else if (block === 'ALL') {
        delete whereClause.block;
      }
    } else if (user.jurisdictionType === 'STATE' || user.role === ROLES.SYSTEM_ADMIN) {
      if (district && district !== 'ALL') {
        whereClause.district = district as string;
      } else if (district === 'ALL') {
        delete whereClause.district;
      }

      if (block && block !== 'ALL') {
        whereClause.block = block as string;
      } else if (block === 'ALL') {
        delete whereClause.block;
      }
    }

    // 2. Query filters
    if (status && status !== 'ALL') {
      whereClause.status = status as string;
    }
    if (district && district !== 'ALL') {
      whereClause.district = district as string;
    } else if (district === 'ALL') {
      delete whereClause.district;
    }
    if (block && block !== 'ALL') {
      whereClause.block = block as string;
    } else if (block === 'ALL') {
      delete whereClause.block;
    }
    if (priorityLevel && priorityLevel !== 'ALL') {
      whereClause.priorityLevel = priorityLevel as string;
    }
    if (category && category !== 'ALL') {
      whereClause.livelihoodCategories = {
        contains: category as string,
      };
    }
    if (search) {
      const q = (search as string).trim();
      whereClause.OR = [
        { reportNumber: { contains: q } },
        { citizenName: { contains: q } },
        { citizenPhone: { contains: q } },
        { village: { contains: q } },
        { lossDescription: { contains: q } },
      ];
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    // Default: Newest submissions first so incoming reports from website appear immediately!
    let orderByClause: any = [{ submittedAt: 'desc' }, { priorityScore: 'desc' }];
    if (sortBy === 'priority') {
      orderByClause = [{ priorityScore: 'desc' }, { submittedAt: 'desc' }];
    }

    const [reports, totalCount] = await Promise.all([
      prisma.livelihoodReport.findMany({
        where: whereClause,
        include: {
          assignedToUser: {
            select: { id: true, fullName: true, role: true, phone: true },
          },
          verificationRecords: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { outcome: true, verifiedRole: true, createdAt: true },
          },
        },
        orderBy: orderByClause,
        skip,
        take: limitNum,
      }),
      prisma.livelihoodReport.count({ where: whereClause }),
    ]);

    // Parse categories JSON string
    const formatted = reports.map((r) => ({
      ...r,
      livelihoodCategories: JSON.parse(r.livelihoodCategories || '[]'),
      vulnerabilityFlags: r.vulnerabilityFlags ? JSON.parse(r.vulnerabilityFlags) : [],
    }));

    res.json({
      success: true,
      reports: formatted,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/:id - Admin case detail view with complete audit and verification records
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await prisma.livelihoodReport.findUnique({
      where: { id },
      include: {
        assignedToUser: {
          select: { id: true, fullName: true, email: true, role: true, phone: true, department: true },
        },
        verificationRecords: {
          include: {
            verifiedByUser: {
              select: { id: true, fullName: true, role: true, phone: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        workflowEvents: {
          orderBy: { createdAt: 'desc' },
        },
        followUpActions: {
          include: {
            recordedByUser: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        escalationRecords: {
          include: {
            escalatedByUser: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!report) {
      res.status(404).json({ success: false, message: 'रिपोर्ट नहीं मिली (Report not found)' });
      return;
    }

    // Role-based jurisdiction check
    const allowed = WorkflowEngine.canAccessJurisdiction(
      req.user!.role,
      req.user!.jurisdictionType,
      req.user!.jurisdictionName,
      report.district,
      report.block
    );

    if (!allowed && req.user!.role !== ROLES.VOLUNTEER) {
      res.status(403).json({
        success: false,
        message: 'इस जिले या प्रखंड की रिपोर्ट देखने का अधिकार नहीं है (Out of jurisdiction)',
      });
      return;
    }

    res.json({
      success: true,
      report: {
        ...report,
        livelihoodCategories: JSON.parse(report.livelihoodCategories || '[]'),
        vulnerabilityFlags: report.vulnerabilityFlags ? JSON.parse(report.vulnerabilityFlags) : [],
        photoUrls: report.photoUrls ? JSON.parse(report.photoUrls) : [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/reports/:id/status - Status transition with validated state machine
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: targetStatus, remarks } = StatusUpdateSchema.parse(req.body);
    const user = req.user!;

    const report = await prisma.livelihoodReport.findUnique({ where: { id } });
    if (!report) {
      res.status(404).json({ success: false, message: 'रिपोर्ट नहीं मिली' });
      return;
    }

    // Check transition validity
    const check = WorkflowEngine.canTransition(
      report.status as ReportStatusType,
      targetStatus as ReportStatusType,
      user.role
    );

    if (!check.allowed) {
      res.status(403).json({ success: false, message: check.reason });
      return;
    }

    // Update status
    const updated = await prisma.livelihoodReport.update({
      where: { id },
      data: {
        status: targetStatus,
        closedAt: targetStatus === REPORT_STATUS.CLOSED ? new Date() : report.closedAt,
      },
    });

    // Record workflow event in audit log
    await AuditService.logWorkflowEvent({
      reportId: id,
      actorUserId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      action: 'STATUS_CHANGE',
      fromStatus: report.status,
      toStatus: targetStatus,
      remarks: remarks || 'स्थिति परिवर्तन (Status updated)',
    });

    res.json({
      success: true,
      message: `स्थिति सफलता पूर्वक '${targetStatus}' में बदली गई।`,
      report: updated,
    });
  } catch (error: any) {
    console.error('Error changing report status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reports/:id/assign - Assign case to on-ground volunteer or officer
router.post(
  '/:id/assign',
  authenticateToken,
  requireRoles(ROLES.BDO, ROLES.DDC, ROLES.SDM, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { assignedUserId, remarks } = req.body;
      const user = req.user!;

      if (!assignedUserId) {
        res.status(400).json({ success: false, message: 'आवंटित अधिकारी/स्वयंसेवक चुनें' });
        return;
      }

      const assignedUser = await prisma.user.findUnique({ where: { id: assignedUserId } });
      if (!assignedUser) {
        res.status(404).json({ success: false, message: 'नामित उपयोगकर्ता नहीं मिला' });
        return;
      }

      const report = await prisma.livelihoodReport.findUnique({ where: { id } });
      if (!report) {
        res.status(404).json({ success: false, message: 'रिपोर्ट नहीं मिली' });
        return;
      }

      const newStatus =
        report.status === REPORT_STATUS.SUBMITTED || report.status === REPORT_STATUS.AWAITING_REVIEW
          ? REPORT_STATUS.ASSIGNED_FOR_VERIFICATION
          : report.status;

      const updated = await prisma.livelihoodReport.update({
        where: { id },
        data: {
          assignedUserId: assignedUser.id,
          assignedRole: assignedUser.role,
          status: newStatus,
        },
      });

      await AuditService.logWorkflowEvent({
        reportId: id,
        actorUserId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'ASSIGN',
        fromStatus: report.status,
        toStatus: newStatus,
        remarks: `${assignedUser.fullName} (${assignedUser.role}) को सौंपा गया: ${remarks || 'सत्यापन आवंटन'}`,
      });

      res.json({
        success: true,
        message: `मामला ${assignedUser.fullName} को आवंटित किया गया।`,
        report: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/reports/:id/escalate - Escalate unresolved case or bottleneck to higher authority
router.post('/:id/escalate', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = EscalationSubmissionSchema.parse(req.body);
    const user = req.user!;

    const report = await prisma.livelihoodReport.findUnique({ where: { id } });
    if (!report) {
      res.status(404).json({ success: false, message: 'रिपोर्ट नहीं मिली' });
      return;
    }

    const escalation = await prisma.escalationRecord.create({
      data: {
        reportId: id,
        escalatedByUserId: user.id,
        escalatedFromRole: user.role,
        escalatedToRole: validated.escalatedToRole,
        reason: validated.reason,
        administrativeNote: validated.administrativeNote,
      },
    });

    // Recalculate priority with aging/escalation boost
    const updatedScore = Math.min(100, report.priorityScore + 15);
    await prisma.livelihoodReport.update({
      where: { id },
      data: {
        priorityScore: updatedScore,
        priorityLevel: 'URGENT',
      },
    });

    await AuditService.logWorkflowEvent({
      reportId: id,
      actorUserId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      action: 'ESCALATE',
      fromStatus: report.status,
      toStatus: report.status,
      remarks: `${user.role} द्वारा ${validated.escalatedToRole} को एस्केलेट किया गया। कारण: ${validated.reason} - ${validated.administrativeNote}`,
    });

    res.json({
      success: true,
      message: `मामला ${validated.escalatedToRole} को अग्रसारित (Escalated) कर दिया गया है।`,
      escalation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reports/:id/follow-up - Record recovery follow-up action (JEEViKA, Cattle fodder, MGNREGA)
router.post(
  '/:id/follow-up',
  authenticateToken,
  requireRoles(ROLES.BDO, ROLES.DDC, ROLES.DPO, ROLES.SDM, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validated = FollowUpActionSchema.parse(req.body);
      const user = req.user!;

      const report = await prisma.livelihoodReport.findUnique({ where: { id } });
      if (!report) {
        res.status(404).json({ success: false, message: 'रिपोर्ट नहीं मिली' });
        return;
      }

      const followUp = await prisma.followUpAction.create({
        data: {
          reportId: id,
          programmeType: validated.programmeType,
          assignedDepartment: validated.assignedDepartment,
          actionDetails: validated.actionDetails,
          targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
          recordedByUserId: user.id,
          status: 'IN_PROGRESS',
        },
      });

      // Advance status to REFERRED_FOR_RECOVERY or ACTION_RECORDED
      const newStatus =
        report.status === REPORT_STATUS.VERIFIED || report.status === REPORT_STATUS.PARTIALLY_VERIFIED
          ? REPORT_STATUS.REFERRED_FOR_RECOVERY
          : report.status;

      await prisma.livelihoodReport.update({
        where: { id },
        data: { status: newStatus },
      });

      await AuditService.logWorkflowEvent({
        reportId: id,
        actorUserId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'REFER_RECOVERY',
        fromStatus: report.status,
        toStatus: newStatus,
        remarks: `${validated.assignedDepartment} (${validated.programmeType}): ${validated.actionDetails}`,
      });

      res.json({
        success: true,
        message: 'पुनर्प्राप्ति अनुवर्ती कार्रवाई दर्ज की गई।',
        followUp,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
