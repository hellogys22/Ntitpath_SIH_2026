import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { DocumentService } from '../services/document.service';

export class DocumentController {
  static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationId, approvalId, docType, name, extractedText, extractedMetadata } = req.body;

      let parsedMetadata: any = undefined;
      if (typeof extractedMetadata === 'string') {
        try {
          parsedMetadata = JSON.parse(extractedMetadata);
        } catch (e) {}
      } else if (typeof extractedMetadata === 'object') {
        parsedMetadata = extractedMetadata;
      }

      const document = await DocumentService.uploadDocument({
        applicationId,
        approvalId,
        docType,
        name,
        file: req.file,
        extractedText,
        extractedMetadata: parsedMetadata,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded and consistency audit triggered',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const documents = await DocumentService.getDocumentsByApplication(applicationId);
      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  static async analyzeDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analysis = await DocumentService.analyzeDocument(id);
      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  static async runConsistencyAudit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const result = await DocumentService.runConsistencyAudit(applicationId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resolveMismatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const resolved = await DocumentService.resolveMismatch(id, resolutionNotes, req.user?.id);
      res.status(200).json({
        success: true,
        message: 'Inconsistency marked resolved and application risk recalculated',
        data: resolved,
      });
    } catch (error) {
      next(error);
    }
  }
}
