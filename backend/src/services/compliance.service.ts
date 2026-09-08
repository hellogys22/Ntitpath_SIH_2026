import prisma from '../prisma/client';

export class ComplianceService {
  static async getApplicationCompliances(applicationId: string) {
    return prisma.complianceItem.findMany({
      where: { applicationId },
      orderBy: { dueDate: 'asc' },
    });
  }

  static async updateComplianceStatus(complianceId: string, status: string, lastFiledDate?: string) {
    return prisma.complianceItem.update({
      where: { id: complianceId },
      data: {
        status,
        lastFiledDate: lastFiledDate ? new Date(lastFiledDate) : new Date(),
      },
    });
  }
}
