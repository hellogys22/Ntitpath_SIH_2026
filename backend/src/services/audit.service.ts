import prisma from '../prisma/client';

export class AuditService {
  static async log(params: {
    userId?: string;
    applicationId?: string;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: params.userId,
          applicationId: params.applicationId,
          action: params.action,
          details: params.details,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
      return null;
    }
  }

  static async getLogsForApplication(applicationId: string) {
    return prisma.auditLog.findMany({
      where: { applicationId },
      include: { user: { select: { id: true, name: true, role: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async getRecentLogs(limit = 100) {
    return prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, name: true, role: true, email: true } },
        application: { select: { id: true, applicationNumber: true, projectTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
