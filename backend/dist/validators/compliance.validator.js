"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplianceStatusSchema = exports.createComplianceItemSchema = void 0;
const zod_1 = require("zod");
exports.createComplianceItemSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid('Application ID is required'),
    title: zod_1.z.string().min(3, 'Title is required'),
    department: zod_1.z.string().min(2, 'Department is required'),
    regulation: zod_1.z.string().min(2, 'Regulation is required'),
    frequency: zod_1.z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL']).default('ANNUAL'),
    dueDate: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
    status: zod_1.z.enum(['PENDING', 'COMPLIANT', 'OVERDUE', 'UPCOMING']).default('UPCOMING'),
    penaltyRisk: zod_1.z.string().optional(),
});
exports.updateComplianceStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'COMPLIANT', 'OVERDUE', 'UPCOMING']),
    lastFiledDate: zod_1.z.string().optional(),
});
