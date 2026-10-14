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
  citizenName: z.string().min(1, 'कृपया अपना नाम दर्ज करें / Name is required'),
  citizenPhone: z.string().min(7, 'कृपया वैध मोबाइल नंबर दर्ज करें (Valid phone number required)'),
  citizenEmail: z.string().nullable().optional(),
  preferredLanguage: z.enum(['hi', 'bho', 'en']).default('hi'),
  isVoiceReport: z.boolean().default(false),
  rawTranscript: z.string().nullable().optional(),
  confirmedTranscript: z.string().min(2, 'नुकसान का विवरण आवश्यक है / Loss description is required'),
  district: z.string().min(1, 'जिला चुनें / District is required').default('Supaul'),
  block: z.string().min(1, 'प्रखंड चुनें / Block is required').default('Nirmali'),
  panchayat: z.string().min(1, 'पंचायत चुनें / Panchayat is required').default('Mahuwa'),
  village: z.string().min(1, 'गांव/टोला दर्ज करें / Village is required'),
  wardNumber: z.string().nullable().optional(),
  livelihoodCategories: z.array(z.string()).default(['CROP']),
  lossDescription: z.string().nullable().optional(),
  estimatedLossAmount: z.number().nullable().optional(),
  disruptionDurationDays: z.number().nullable().optional(),
  householdSize: z.number().nullable().optional().default(5),
  vulnerabilityFlags: z.array(z.string()).nullable().optional(),
  gpsLatitude: z.number().nullable().optional(),
  gpsLongitude: z.number().nullable().optional(),
  photoUrls: z.array(z.string()).nullable().optional(),
  audioSimulationUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
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
