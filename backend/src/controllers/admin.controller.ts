import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AdminService } from '../services/admin.service';
import { RiskService } from '../services/risk.service';
import { AuditService } from '../services/audit.service';
import prisma from '../prisma/client';

export class AdminController {
  static async getDashboardAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await AdminService.getDashboardAnalytics();
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, riskLevel, sector, search, page, limit } = req.query;
      const result = await AdminService.getAllApplications({
        status: status as string,
        riskLevel: riskLevel as string,
        sector: sector as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reviewApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, queryComment, officerNotes } = req.body;
      const officerId = req.user?.id;

      const updated = await AdminService.reviewApproval(id, status, queryComment, officerNotes, officerId);
      res.status(200).json({
        success: true,
        message: `Approval status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resolveRisk(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const resolved = await RiskService.resolveRisk(id, resolutionNotes, req.user?.id);
      res.status(200).json({
        success: true,
        message: 'Risk item resolved successfully',
        data: resolved,
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
          complianceItems: true,
          auditLogs: { include: { user: true }, orderBy: { createdAt: 'desc' } },
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

  static async getAllRisks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const risks = await prisma.riskItem.findMany({
        include: {
          application: { select: { id: true, applicationNumber: true, projectTitle: true } },
          approval: { select: { id: true, approvalCode: true, name: true, department: true } },
        },
        orderBy: [{ isResolved: 'asc' }, { createdAt: 'desc' }],
      });

      res.status(200).json({
        success: true,
        data: risks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const documents = await prisma.document.findMany({
        include: {
          application: { select: { id: true, applicationNumber: true, projectTitle: true } },
          approval: { select: { id: true, approvalCode: true, name: true, department: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = await AuditService.getRecentLogs(100);
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
