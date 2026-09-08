import prisma from '../prisma/client';
import { MASTER_APPROVAL_RULES } from '../rules/approvalRules';
import { computeDependencyGraph } from '../rules/dependencyRules';
import { DependencyGraphNode } from '../types';
import { AuditService } from './audit.service';

export class PlanService {
  /**
   * Generates tailored approval journey for a project application
   */
  static async generateApplicationPlan(businessId: string, projectTitle: string, description?: string, pollutionCategory = 'ORANGE', userId?: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new Error('Business profile not found');
    }

    // Filter relevant rules based on industry parameters
    const applicableRules = MASTER_APPROVAL_RULES.filter((rule) => {
      if (rule.condition) {
        return rule.condition({
          sector: business.sector,
          investmentCr: business.investmentCr,
          employees: business.employees,
          landAcres: business.landAcres,
          powerRequirementKw: business.powerRequirementKw || 250,
          waterRequirementKld: business.waterRequirementKld || 50,
          pollutionCategory,
        });
      }
      return true;
    });

    // Compute DAG to calculate total estimated days and critical path
    const graphNodes: DependencyGraphNode[] = applicableRules.map((r) => ({
      code: r.approvalCode,
      name: r.name,
      department: r.department,
      stage: r.stage,
      slaDays: r.slaDays,
      isCriticalPath: r.isCriticalPath,
      status: 'NOT_STARTED',
      dependencies: r.dependencies,
      parallelGroup: r.parallelGroupId,
    }));

    const dagResult = computeDependencyGraph(graphNodes);
    const criticalCodes = new Set(dagResult.criticalPath.map((c) => c.code));

    const applicationCount = await prisma.application.count();
    const appNumber = `NTP-${String(applicationCount + 128).padStart(5, '0')}`;

    // Create Application record
    const application = await prisma.application.create({
      data: {
        applicationNumber: appNumber,
        businessId,
        projectTitle,
        description: description || `Industrial setup project in ${business.sector} at ${business.city}, ${business.state}`,
        pollutionCategory,
        status: 'IN_PROGRESS',
        readinessScore: 72,
        riskLevel: 'HIGH',
        estimatedDays: dagResult.totalCriticalPathDays || 65,
        parallelTracksCount: Object.keys(dagResult.parallelTracks).length || 3,
        totalApprovals: applicableRules.length,
        completedApprovals: 0,
        criticalPathApprovals: dagResult.criticalPath.length,
      },
    });

    // Create Approval records
    for (const rule of applicableRules) {
      await prisma.approval.create({
        data: {
          applicationId: application.id,
          approvalCode: rule.approvalCode,
          name: rule.name,
          department: rule.department,
          category: rule.category,
          stage: rule.stage,
          status: 'NOT_STARTED',
          slaDays: rule.slaDays,
          expectedDays: rule.expectedDays,
          parallelGroupId: rule.parallelGroupId,
          isCriticalPath: criticalCodes.has(rule.approvalCode),
          requiredDocsJson: JSON.stringify(rule.requiredDocuments),
          dependenciesJson: JSON.stringify(rule.dependencies),
        },
      });
    }

    // Create default compliance timeline items
    const defaultCompliances = [
      {
        title: 'Half-Yearly Environmental Compliance Report (EC/CTE)',
        department: 'CECB',
        regulation: 'Environment Protection Act 1986',
        frequency: 'ANNUAL',
        dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: 'UPCOMING',
        penaltyRisk: '₹1,00,000 fine and show cause notice',
      },
      {
        title: 'Factory Safety Audit & Form 21 Return',
        department: 'DISH Chhattisgarh',
        regulation: 'Factories Act 1948, Rule 107',
        frequency: 'ANNUAL',
        dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        status: 'UPCOMING',
        penaltyRisk: 'Factory closure order & statutory fine',
      },
      {
        title: 'FSSAI Annual Return Filing (Form D-1)',
        department: 'FSSAI Raipur',
        regulation: 'Food Safety and Standards Act 2006',
        frequency: 'ANNUAL',
        dueDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
        status: 'UPCOMING',
        penaltyRisk: '₹100/day penalty up to cancellation',
      },
      {
        title: 'CSPDCL HT Power Energy Metering & Power Factor Audit',
        department: 'CSPDCL',
        regulation: 'Chhattisgarh State Electricity Code',
        frequency: 'MONTHLY',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        penaltyRisk: 'Low Power Factor Surcharge (up to 10% on energy bill)',
      },
    ];

    for (const comp of defaultCompliances) {
      await prisma.complianceItem.create({
        data: {
          applicationId: application.id,
          ...comp,
        },
      });
    }

    await AuditService.log({
      userId,
      applicationId: application.id,
      action: 'APPLICATION_INITIALIZED',
      details: `Generated intelligent approval pathway with ${applicableRules.length} approvals across ${dagResult.totalCriticalPathDays} days.`,
    });

    return prisma.application.findUnique({
      where: { id: application.id },
      include: {
        business: true,
        approvals: true,
        complianceItems: true,
      },
    });
  }
}
