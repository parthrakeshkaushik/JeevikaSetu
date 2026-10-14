import { Request } from 'express';
import { z } from 'zod';
import { RoleType, ReportStatusType } from '../config.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleType;
  department?: string | null;
  jurisdictionType?: string | null;
  jurisdictionName?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Zod validation schemas
export const CitizenReportSchema = z.object({
  citizenName: z.string().min(2, 'नामक आवश्यक बा / Name is required'),
  citizenPhone: z.string().regex(/^[6-9]\d{9}$/, 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (Valid 10-digit phone number)'),
  preferredLanguage: z.enum(['hi', 'bho', 'en']).default('hi'),
  isVoiceReport: z.boolean().default(false),
  rawTranscript: z.string().optional(),
  confirmedTranscript: z.string().min(5, 'नुकसान का विवरण आवश्यक है / Loss description is required'),
  district: z.string().min(2, 'जिला चुनें / District is required'),
  block: z.string().min(2, 'प्रखंड चुनें / Block is required'),
  panchayat: z.string().min(2, 'पंचायत चुनें / Panchayat is required'),
  village: z.string().min(2, 'गांव/टोला दर्ज करें / Village is required'),
  wardNumber: z.string().optional(),
  livelihoodCategories: z.array(z.string()).min(1, 'कम से कम एक आजीविका श्रेणी चुनें / Select at least one category'),
  lossDescription: z.string().optional(),
  estimatedLossAmount: z.number().nonnegative().optional(),
  disruptionDurationDays: z.number().int().nonnegative().optional(),
  householdSize: z.number().int().positive().default(5),
  vulnerabilityFlags: z.array(z.string()).optional(),
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
  photoUrls: z.array(z.string()).optional(),
});

export const StatusUpdateSchema = z.object({
  status: z.string(),
  remarks: z.string().min(3, 'कारण या टिप्पणी दर्ज करें / Remarks required'),
  assignedUserId: z.string().optional(),
  assignedRole: z.string().optional(),
});

export const VerificationSubmissionSchema = z.object({
  reportId: z.string(),
  outcome: z.enum(['VERIFIED', 'PARTIALLY_VERIFIED', 'UNABLE_TO_VERIFY', 'ADDITIONAL_INFO_REQUIRED']),
  fieldNotes: z.string().min(5, 'क्षेत्र सत्यापन टिप्पणी आवश्यक है / Field notes required'),
  reasonForDecision: z.string().min(5, 'निर्णय का कारण दर्ज करें / Decision rationale required'),
  verifiedCropLossBigha: z.number().optional(),
  verifiedCattleLost: z.number().optional(),
  verifiedEquipmentLoss: z.string().optional(),
  recommendedAction: z.string().optional(),
  photoEvidenceUrls: z.array(z.string()).optional(),
});

export const EscalationSubmissionSchema = z.object({
  reportId: z.string(),
  escalatedToRole: z.enum(['ADM', 'SDM', 'DM']),
  reason: z.enum(['OVERDUE_VERIFICATION', 'UNRESOLVED_BOTTLENECK', 'SEVERE_VULNERABILITY', 'PUBLIC_REPRESENTATION']),
  administrativeNote: z.string().min(5, 'प्रशासनिक निर्देश या कारण दर्ज करें / Administrative note required'),
});

export const FollowUpActionSchema = z.object({
  reportId: z.string(),
  programmeType: z.enum([
    'JEEVIKA_SHG',
    'MGNREGA_JOB_DEMAND',
    'ANIMAL_HUSBANDRY_CAMP',
    'SEED_INPUT_SUBSIDY',
    'REVENUE_RELIEF_RECORDS',
    'MICRO_CREDIT_RECOVERY',
    'SKILL_TRAINING',
  ]),
  assignedDepartment: z.string(),
  actionDetails: z.string().min(5, 'कार्रवाई विवरण आवश्यक है / Action details required'),
  targetDate: z.string().optional(),
});
