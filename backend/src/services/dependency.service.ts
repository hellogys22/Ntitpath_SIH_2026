import prisma from '../prisma/client';
import { computeDependencyGraph } from '../rules/dependencyRules';
import { DependencyGraphNode } from '../types';

export class DependencyService {
  static async getApplicationGraph(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        approvals: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const nodes: DependencyGraphNode[] = application.approvals.map((appr) => {
      let dependencies: string[] = [];
      try {
        if (appr.dependenciesJson) dependencies = JSON.parse(appr.dependenciesJson);
      } catch (e) {}

      return {
        code: appr.approvalCode,
        name: appr.name,
        department: appr.department,
        stage: appr.stage,
        slaDays: appr.slaDays,
        isCriticalPath: appr.isCriticalPath,
        status: appr.status,
        dependencies,
        parallelGroup: appr.parallelGroupId || 'GENERAL',
      };
    });

    const dagResult = computeDependencyGraph(nodes);

    // Identify current bottlenecks
    const bottlenecks = application.approvals
      .filter((appr) => appr.status === 'QUERIED' || (appr.isCriticalPath && appr.status !== 'APPROVED'))
      .map((appr) => ({
        approvalCode: appr.approvalCode,
        name: appr.name,
        department: appr.department,
        stage: appr.stage,
        status: appr.status,
        isCriticalPath: appr.isCriticalPath,
        slaDays: appr.slaDays,
        delayReason:
          appr.status === 'QUERIED'
            ? appr.queryComment || 'Department raised a statutory query'
            : 'Pre-requisite for downstream approvals on Critical Path',
      }));

    return {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      totalApprovals: nodes.length,
      criticalPathNodes: dagResult.criticalPath,
      totalCriticalPathDays: dagResult.totalCriticalPathDays,
      parallelTracks: dagResult.parallelTracks,
      bottlenecks,
      topologicalOrder: dagResult.sortedNodes,
    };
  }
}
