import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../prisma/client';
import { PlanService } from '../services/plan.service';
import { DependencyService } from '../services/dependency.service';
import { RiskService } from '../services/risk.service';
import { ReadinessService } from '../services/readiness.service';
import { NextActionService } from '../services/nextAction.service';
import { DocumentService } from '../services/document.service';
import { SupportSchemeService } from '../services/supportScheme.service';

export class ApplicationController {
  static async createApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { businessId, projectTitle, description, pollutionCategory } = req.body;
      const application = await PlanService.generateApplicationPlan(
        businessId,
        projectTitle,
        description,
        pollutionCategory,
        req.user?.id
      );

      res.status(201).json({
        success: true,
        message: 'Application and dynamic approval roadmap created successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicationDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          business: true,
          approvals: {
            include: { documents: true },
            orderBy: [{ stage: 'asc' }, { slaDays: 'asc' }],
          },
          documents: true,
          riskItems: true,
          complianceItems: { orderBy: { dueDate: 'asc' } },
        },
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      // Concurrently run intelligence engines
      const [dependencyGraph, riskAnalysis, readiness, nextAction, consistencyAudit, matchingSchemes] =
        await Promise.all([
          DependencyService.getApplicationGraph(id),
          RiskService.evaluateApplicationRisk(id),
          ReadinessService.calculateReadiness(id),
          NextActionService.getNextBestAction(id),
          DocumentService.runConsistencyAudit(id),
          SupportSchemeService.getMatchingSchemes(application.business.sector, application.business.investmentCr),
        ]);

      res.status(200).json({
        success: true,
        data: {
          application,
          intelligence: {
            dependencyGraph,
            riskAnalysis,
            readiness,
            nextAction,
            consistencyAudit,
            matchingSchemes,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApprovals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const approvals = await prisma.approval.findMany({
        where: { applicationId: id },
        include: { documents: true },
        orderBy: [{ stage: 'asc' }, { slaDays: 'asc' }],
      });

      res.status(200).json({
        success: true,
        data: approvals,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDependencyGraph(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const graph = await DependencyService.getApplicationGraph(id);
      res.status(200).json({
        success: true,
        data: graph,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRisks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const risks = await RiskService.getRisksByApplication(id);
      res.status(200).json({
        success: true,
        data: risks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'DEPARTMENT_OFFICER';

      const whereClause: any = {};
      if (!isAdmin && userId) {
        whereClause.business = { userId };
      }

      const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          business: true,
          approvals: true,
          riskItems: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          business: true,
          approvals: { include: { documents: true }, orderBy: [{ stage: 'asc' }, { slaDays: 'asc' }] },
          documents: true,
          riskItems: true,
          complianceItems: { orderBy: { dueDate: 'asc' } },
        },
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBottleneck(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const graph = await DependencyService.getApplicationGraph(id);
      const topBottleneck = graph.bottlenecks.length > 0 ? graph.bottlenecks[0] : null;
      res.status(200).json({
        success: true,
        data: {
          bottlenecks: graph.bottlenecks,
          primaryBottleneck: topBottleneck,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async recalculateRisk(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const evaluation = await RiskService.evaluateApplicationRisk(id);
      const readiness = await ReadinessService.calculateReadiness(id);
      res.status(200).json({
        success: true,
        message: 'Risk and readiness recalculated from latest database state',
        data: {
          risk: evaluation,
          readiness,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNextAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const nextAction = await NextActionService.getNextBestAction(id);
      res.status(200).json({
        success: true,
        data: nextAction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompliance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const items = await prisma.complianceItem.findMany({
        where: { applicationId: id },
        orderBy: { dueDate: 'asc' },
      });
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
}
