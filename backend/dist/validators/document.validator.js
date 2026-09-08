"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumentStatusSchema = exports.uploadDocumentMetadataSchema = void 0;
const zod_1 = require("zod");
exports.uploadDocumentMetadataSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid('Application ID is required'),
    approvalId: zod_1.z.string().uuid().optional(),
    docType: zod_1.z.string().min(2, 'Document type is required'),
    name: zod_1.z.string().min(2, 'Document name is required'),
    extractedText: zod_1.z.string().optional(),
    extractedMetadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.updateDocumentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['NOT_UPLOADED', 'UPLOADED', 'VERIFIED', 'REJECTED', 'MISMATCH_DETECTED']),
    mismatchDetails: zod_1.z.record(zod_1.z.any()).optional(),
});
