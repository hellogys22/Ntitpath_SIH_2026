import { z } from 'zod';

export const createApplicationSchema = z.object({
  businessId: z.string().uuid('Valid business ID is required'),
  projectTitle: z.string().min(3, 'Project title is required'),
  description: z.string().optional(),
  pollutionCategory: z.enum(['GREEN', 'ORANGE', 'RED', 'WHITE']).default('ORANGE'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ACTION_REQUIRED']),
});

export const updateApprovalStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'PENDING_DOCS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'QUERIED']),
  queryComment: z.string().optional(),
  officerNotes: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApprovalStatusInput = z.infer<typeof updateApprovalStatusSchema>;
