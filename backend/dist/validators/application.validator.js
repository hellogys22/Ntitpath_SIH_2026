"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApprovalStatusSchema = exports.updateApplicationStatusSchema = exports.createApplicationSchema = void 0;
const zod_1 = require("zod");
exports.createApplicationSchema = zod_1.z.object({
    businessId: zod_1.z.string().uuid('Valid business ID is required'),
    projectTitle: zod_1.z.string().min(3, 'Project title is required'),
    description: zod_1.z.string().optional(),
    pollutionCategory: zod_1.z.enum(['GREEN', 'ORANGE', 'RED', 'WHITE']).default('ORANGE'),
});
exports.updateApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ACTION_REQUIRED']),
});
exports.updateApprovalStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['NOT_STARTED', 'PENDING_DOCS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'QUERIED']),
    queryComment: zod_1.z.string().optional(),
    officerNotes: zod_1.z.string().optional(),
});
