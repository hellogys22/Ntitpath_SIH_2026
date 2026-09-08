import prisma from '../prisma/client';

export class RiskService {
  static async evaluateApplicationRisk(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        approvals: true,
        documents: true,
        riskItems: true,
        complianceItems: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const unresolvedRisks = application.riskItems.filter((r) => !r.isResolved);
    const queriedApprovals = application.approvals.filter((a) => a.status === 'QUERIED');
    const mismatchDocs = application.documents.filter((d) => d.status === 'MISMATCH_DETECTED');
    const overdueCompliances = application.complianceItems.filter((c) => c.status === 'OVERDUE');

    let calculatedLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    const riskDrivers: string[] = [];

    if (unresolvedRisks.some((r) => r.severity === 'HIGH' || r.severity === 'CRITICAL') || mismatchDocs.length > 0) {
      calculatedLevel = 'HIGH';
      if (mismatchDocs.length > 0) {
        riskDrivers.push(`Cross-document inconsistency detected in ${mismatchDocs.length} key file(s).`);
      }
    } else if (queriedApprovals.length > 0 || overdueCompliances.length > 0 || unresolvedRisks.length > 0) {
      calculatedLevel = 'MEDIUM';
      if (queriedApprovals.length > 0) {
        riskDrivers.push(`${queriedApprovals.length} approval(s) have active department queries.`);
      }
    }

    // Update application risk level in DB
    await prisma.application.update({
      where: { id: applicationId },
      data: { riskLevel: calculatedLevel },
    });

    return {
      applicationId,
      riskLevel: calculatedLevel,
      riskScore: calculatedLevel === 'HIGH' ? 84 : calculatedLevel === 'MEDIUM' ? 45 : 15,
      riskDrivers,
      activeRisks: unresolvedRisks,
      queriedApprovalsCount: queriedApprovals.length,
      inconsistentDocumentsCount: mismatchDocs.length,
      overdueCompliancesCount: overdueCompliances.length,
      mitigationSummary:
        calculatedLevel === 'HIGH'
          ? 'Urgent resolution required for document consistency before proceeding with CECB CTE & DISH clearances.'
          : 'Risk level is stable. Continue parallel track execution.',
    };
  }

  static async getRisksByApplication(applicationId: string) {
    return prisma.riskItem.findMany({
      where: { applicationId },
      include: {
        approval: {
          select: { id: true, approvalCode: true, name: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async resolveRisk(riskId: string, resolutionNotes?: string, userId?: string) {
    const risk = await prisma.riskItem.findUnique({
      where: { id: riskId },
    });

    if (!risk) throw new Error('Risk item not found');

    const updated = await prisma.riskItem.update({
      where: { id: riskId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });

    // Re-evaluate application risk
    await this.evaluateApplicationRisk(risk.applicationId);

    return updated;
  }
}
