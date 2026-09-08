import { z } from 'zod';

export const reviewApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'QUERIED', 'UNDER_REVIEW']),
  queryComment: z.string().optional(),
  officerNotes: z.string().optional(),
});

export const resolveRiskSchema = z.object({
  isResolved: z.boolean().default(true),
  resolutionNotes: z.string().optional(),
});
