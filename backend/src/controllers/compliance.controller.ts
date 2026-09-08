import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ComplianceService } from '../services/compliance.service';
import { SupportSchemeService } from '../services/supportScheme.service';
import prisma from '../prisma/client';

export class ComplianceController {
  static async getCompliances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const list = await ComplianceService.getApplicationCompliances(applicationId);
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateComplianceStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, lastFiledDate } = req.body;
      const updated = await ComplianceService.updateComplianceStatus(id, status, lastFiledDate);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSchemes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sector = (req.query.sector as string) || 'Food Processing';
      const investmentCr = parseFloat((req.query.investmentCr as string) || '5.0');
      const schemes = await SupportSchemeService.getMatchingSchemes(sector, investmentCr);
      res.status(200).json({
        success: true,
        data: schemes,
      });
    } catch (error) {
      next(error);
    }
  }
}
