import prisma from '../db.js';

export class AuditService {
  public static async logWorkflowEvent(params: {
    reportId: string;
    actorUserId?: string | null;
    actorName: string;
    actorRole: string;
    action: string;
    fromStatus?: string | null;
    toStatus?: string | null;
    remarks?: string | null;
    metadata?: Record<string, any>;
  }) {
    return prisma.workflowEvent.create({
      data: {
        reportId: params.reportId,
        actorUserId: params.actorUserId || undefined,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: params.action,
        fromStatus: params.fromStatus,
        toStatus: params.toStatus,
        remarks: params.remarks,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  }

  public static async logSystemAction(params: {
    action: string;
    userId?: string | null;
    userEmail?: string | null;
    userRole?: string | null;
    ipAddress?: string | null;
    details?: string | null;
  }) {
    return prisma.systemAuditLog.create({
      data: {
        action: params.action,
        userId: params.userId || undefined,
        userEmail: params.userEmail || undefined,
        userRole: params.userRole || undefined,
        ipAddress: params.ipAddress || undefined,
        details: params.details,
      },
    });
  }
}
