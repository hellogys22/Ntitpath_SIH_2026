import { z } from 'zod';

export const uploadDocumentMetadataSchema = z.object({
  applicationId: z.string().uuid('Application ID is required'),
  approvalId: z.string().uuid().optional(),
  docType: z.string().min(2, 'Document type is required'),
  name: z.string().min(2, 'Document name is required'),
  extractedText: z.string().optional(),
  extractedMetadata: z.record(z.any()).optional(),
});

export const updateDocumentStatusSchema = z.object({
  status: z.enum(['NOT_UPLOADED', 'UPLOADED', 'VERIFIED', 'REJECTED', 'MISMATCH_DETECTED']),
  mismatchDetails: z.record(z.any()).optional(),
});
