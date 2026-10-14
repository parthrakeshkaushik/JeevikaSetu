// Validated State Machine and Workflow Engine for JeevikaSetu
import { RoleType, ReportStatusType, REPORT_STATUS, ROLES } from '../config.js';

interface TransitionRule {
  from: ReportStatusType[];
  to: ReportStatusType;
  allowedRoles: RoleType[];
  requiresRemarks: boolean;
}

export const WORKFLOW_TRANSITIONS: TransitionRule[] = [
  // Initial triage / Assignment
  {
    from: [REPORT_STATUS.SUBMITTED],
    to: REPORT_STATUS.AWAITING_REVIEW,
    allowedRoles: [ROLES.BDO, ROLES.DDC, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN],
    requiresRemarks: false,
  },
  {
    from: [REPORT_STATUS.SUBMITTED, REPORT_STATUS.AWAITING_REVIEW],
    to: REPORT_STATUS.ASSIGNED_FOR_VERIFICATION,
    allowedRoles: [ROLES.BDO, ROLES.DDC, ROLES.SDM, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true, // Reason for assignment or notes for volunteer
  },
  // Volunteer field verification
  {
    from: [REPORT_STATUS.ASSIGNED_FOR_VERIFICATION],
    to: REPORT_STATUS.VERIFICATION_IN_PROGRESS,
    allowedRoles: [ROLES.VOLUNTEER, ROLES.BDO, ROLES.SYSTEM_ADMIN],
    requiresRemarks: false,
  },
  {
    from: [REPORT_STATUS.ASSIGNED_FOR_VERIFICATION, REPORT_STATUS.VERIFICATION_IN_PROGRESS],
    to: REPORT_STATUS.VERIFIED,
    allowedRoles: [ROLES.VOLUNTEER, ROLES.BDO, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  {
    from: [REPORT_STATUS.ASSIGNED_FOR_VERIFICATION, REPORT_STATUS.VERIFICATION_IN_PROGRESS],
    to: REPORT_STATUS.PARTIALLY_VERIFIED,
    allowedRoles: [ROLES.VOLUNTEER, ROLES.BDO, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  {
    from: [REPORT_STATUS.ASSIGNED_FOR_VERIFICATION, REPORT_STATUS.VERIFICATION_IN_PROGRESS],
    to: REPORT_STATUS.UNABLE_TO_VERIFY,
    allowedRoles: [ROLES.VOLUNTEER, ROLES.BDO, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  {
    from: [REPORT_STATUS.ASSIGNED_FOR_VERIFICATION, REPORT_STATUS.VERIFICATION_IN_PROGRESS],
    to: REPORT_STATUS.ADDITIONAL_INFO_REQUIRED,
    allowedRoles: [ROLES.VOLUNTEER, ROLES.BDO, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  // Recovery referral & Coordination
  {
    from: [
      REPORT_STATUS.VERIFIED,
      REPORT_STATUS.PARTIALLY_VERIFIED,
      REPORT_STATUS.AWAITING_REVIEW,
    ],
    to: REPORT_STATUS.REFERRED_FOR_RECOVERY,
    allowedRoles: [ROLES.BDO, ROLES.DDC, ROLES.DPO, ROLES.SDM, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  {
    from: [REPORT_STATUS.REFERRED_FOR_RECOVERY],
    to: REPORT_STATUS.FOLLOWUP_IN_PROGRESS,
    allowedRoles: [ROLES.BDO, ROLES.DDC, ROLES.DPO, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  {
    from: [REPORT_STATUS.FOLLOWUP_IN_PROGRESS, REPORT_STATUS.REFERRED_FOR_RECOVERY],
    to: REPORT_STATUS.ACTION_RECORDED,
    allowedRoles: [ROLES.BDO, ROLES.DDC, ROLES.DPO, ROLES.SDM, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  // Case Closure
  {
    from: [
      REPORT_STATUS.ACTION_RECORDED,
      REPORT_STATUS.UNABLE_TO_VERIFY,
      REPORT_STATUS.VERIFIED,
    ],
    to: REPORT_STATUS.CLOSED,
    allowedRoles: [ROLES.BDO, ROLES.DDC, ROLES.ADM, ROLES.DM, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
  // Reopen Case
  {
    from: [REPORT_STATUS.CLOSED, REPORT_STATUS.UNABLE_TO_VERIFY],
    to: REPORT_STATUS.REOPENED,
    allowedRoles: [ROLES.ADM, ROLES.SDM, ROLES.DM, ROLES.SYSTEM_ADMIN],
    requiresRemarks: true,
  },
];

export class WorkflowEngine {
  /**
   * Validate whether a user with given role can execute the transition
   */
  static canTransition(
    currentStatus: ReportStatusType,
    targetStatus: ReportStatusType,
    userRole: RoleType
  ): { allowed: boolean; reason?: string } {
    const rule = WORKFLOW_TRANSITIONS.find(
      (r) => r.from.includes(currentStatus) && r.to === targetStatus
    );

    if (!rule) {
      return {
        allowed: false,
        reason: `अमान्य स्थिति परिवर्तन: '${currentStatus}' से '${targetStatus}' की अनुमति नहीं है। (Invalid transition)`,
      };
    }

    if (!rule.allowedRoles.includes(userRole)) {
      return {
        allowed: false,
        reason: `आपके पद (${userRole}) को यह कार्रवाई करने का अधिकार नहीं है। (Role '${userRole}' not authorized)`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a user can access a report based on jurisdiction
   */
  static canAccessJurisdiction(
    userRole: RoleType,
    userJurisdictionType: string | null | undefined,
    userJurisdictionName: string | null | undefined,
    reportDistrict: string,
    reportBlock: string
  ): boolean {
    // District Magistrate, ADM, DDC have district-wide jurisdiction
    if ([ROLES.DM, ROLES.ADM, ROLES.DDC, ROLES.SYSTEM_ADMIN].includes(userRole as any)) {
      if (!userJurisdictionName) return true;
      return userJurisdictionName.toLowerCase() === reportDistrict.toLowerCase();
    }

    // BDO has block jurisdiction
    if (userRole === ROLES.BDO) {
      if (!userJurisdictionName) return true;
      return userJurisdictionName.toLowerCase() === reportBlock.toLowerCase();
    }

    // SDM has subdivision or district scope
    if (userRole === ROLES.SDM) {
      if (!userJurisdictionName) return true;
      return true;
    }

    // DPO handles programme cases in district
    if (userRole === ROLES.DPO) {
      if (!userJurisdictionName) return true;
      return userJurisdictionName.toLowerCase() === reportDistrict.toLowerCase();
    }

    // Volunteer has assigned panchayat or block scope
    if (userRole === ROLES.VOLUNTEER) {
      return true; // Filtered by assigned reports
    }

    return true;
  }
}
