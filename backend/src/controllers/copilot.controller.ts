import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { CopilotService } from '../services/copilot.service';

export class CopilotController {
  static async query(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationId, question } = req.body;
      if (!applicationId || !question) {
        res.status(400).json({ success: false, message: 'applicationId and question are required' });
        return;
      }

      const answer = await CopilotService.query(applicationId, question);
      res.status(200).json({
        success: true,
        data: answer,
      });
    } catch (error) {
      next(error);
    }
  }
}
