import prisma from '../prisma/client';

export class ReadinessService {
  static async calculateReadiness(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        approvals: true,
        documents: true,
        riskItems: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const totalApprovals = application.approvals.length || 1;
    const approvedApprovals = application.approvals.filter((a) => a.status === 'APPROVED').length;
    const submittedApprovals = application.approvals.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length;

    const totalDocs = application.documents.length || 1;
    const verifiedDocs = application.documents.filter((d) => d.status === 'VERIFIED').length;
    const mismatchDocs = application.documents.filter((d) => d.status === 'MISMATCH_DETECTED').length;

    const unresolvedRisks = application.riskItems.filter((r) => !r.isResolved && (r.severity === 'HIGH' || r.severity === 'CRITICAL')).length;

    // Weighted formula:
    // Approvals: 50%
    // Verified Documents: 30%
    // Zero High Risks & Mismatches: 20%
    const approvalScore = ((approvedApprovals + submittedApprovals * 0.5) / totalApprovals) * 50;
    const documentScore = (verifiedDocs / totalDocs) * 30;
    const riskPenalty = (mismatchDocs * 10) + (unresolvedRisks * 10);
    const riskScore = Math.max(0, 20 - riskPenalty);

    let score = Math.round(approvalScore + documentScore + riskScore);
    score = Math.min(100, Math.max(10, score));

    // Update in application model
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        readinessScore: score,
        completedApprovals: approvedApprovals,
      },
    });

    return {
      applicationId,
      readinessScore: score,
      breakdown: {
        approvalProgress: `${approvedApprovals}/${totalApprovals} approved (${Math.round(approvalScore)}/50 pts)`,
        documentCompleteness: `${verifiedDocs}/${totalDocs} verified (${Math.round(documentScore)}/30 pts)`,
        riskDeduction: `${riskPenalty} pts deducted for active risks/mismatches`,
      },
      potentialScoreWithRemediation: Math.min(100, score + riskPenalty),
    };
  }
}
