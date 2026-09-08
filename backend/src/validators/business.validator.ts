import { z } from 'zod';

export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  entityType: z.string().default('Private Limited'),
  pan: z.string().optional(),
  gstin: z.string().optional(),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().default('Chhattisgarh'),
  pinCode: z.string().optional(),
  sector: z.string().min(2, 'Sector is required (e.g. Food Processing, Solar, Steel)'),
  investmentCr: z.number().positive('Investment must be positive'),
  employees: z.number().int().positive('Employees count must be positive'),
  landAcres: z.number().positive('Land acres must be positive'),
  builtUpAreaSqFt: z.number().positive().optional(),
  powerRequirementKw: z.number().positive().optional(),
  waterRequirementKld: z.number().positive().optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
