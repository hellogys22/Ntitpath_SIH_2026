"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const document_service_1 = require("../services/document.service");
class DocumentController {
    static async uploadDocument(req, res, next) {
        try {
            const { applicationId, approvalId, docType, name, extractedText, extractedMetadata } = req.body;
            let parsedMetadata = undefined;
            if (typeof extractedMetadata === 'string') {
                try {
                    parsedMetadata = JSON.parse(extractedMetadata);
                }
                catch (e) { }
            }
            else if (typeof extractedMetadata === 'object') {
                parsedMetadata = extractedMetadata;
            }
            const document = await document_service_1.DocumentService.uploadDocument({
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getDocuments(req, res, next) {
        try {
            const { applicationId } = req.params;
            const documents = await document_service_1.DocumentService.getDocumentsByApplication(applicationId);
            res.status(200).json({
                success: true,
                data: documents,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async analyzeDocument(req, res, next) {
        try {
            const { id } = req.params;
            const analysis = await document_service_1.DocumentService.analyzeDocument(id);
            res.status(200).json({
                success: true,
                data: analysis,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async runConsistencyAudit(req, res, next) {
        try {
            const { applicationId } = req.params;
            const result = await document_service_1.DocumentService.runConsistencyAudit(applicationId);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async resolveMismatch(req, res, next) {
        try {
            const { id } = req.params;
            const { resolutionNotes } = req.body;
            const resolved = await document_service_1.DocumentService.resolveMismatch(id, resolutionNotes, req.user?.id);
            res.status(200).json({
                success: true,
                message: 'Inconsistency marked resolved and application risk recalculated',
                data: resolved,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DocumentController = DocumentController;
