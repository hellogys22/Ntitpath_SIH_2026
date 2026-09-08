import { z } from 'zod';

export const createComplianceItemSchema = z.object({
  applicationId: z.string().uuid('Application ID is required'),
  title: z.string().min(3, 'Title is required'),
  department: z.string().min(2, 'Department is required'),
  regulation: z.string().min(2, 'Regulation is required'),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL']).default('ANNUAL'),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  status: z.enum(['PENDING', 'COMPLIANT', 'OVERDUE', 'UPCOMING']).default('UPCOMING'),
  penaltyRisk: z.string().optional(),
});

export const updateComplianceStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLIANT', 'OVERDUE', 'UPCOMING']),
  lastFiledDate: z.string().optional(),
});
