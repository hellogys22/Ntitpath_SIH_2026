"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBusinessSchema = exports.createBusinessSchema = void 0;
const zod_1 = require("zod");
exports.createBusinessSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Company name is required'),
    entityType: zod_1.z.string().default('Private Limited'),
    pan: zod_1.z.string().optional(),
    gstin: zod_1.z.string().optional(),
    address: zod_1.z.string().min(3, 'Address is required'),
    city: zod_1.z.string().min(2, 'City is required'),
    state: zod_1.z.string().default('Chhattisgarh'),
    pinCode: zod_1.z.string().optional(),
    sector: zod_1.z.string().min(2, 'Sector is required (e.g. Food Processing, Solar, Steel)'),
    investmentCr: zod_1.z.number().positive('Investment must be positive'),
    employees: zod_1.z.number().int().positive('Employees count must be positive'),
    landAcres: zod_1.z.number().positive('Land acres must be positive'),
    builtUpAreaSqFt: zod_1.z.number().positive().optional(),
    powerRequirementKw: zod_1.z.number().positive().optional(),
    waterRequirementKld: zod_1.z.number().positive().optional(),
});
exports.updateBusinessSchema = exports.createBusinessSchema.partial();
