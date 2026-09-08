"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRiskSchema = exports.reviewApprovalSchema = void 0;
const zod_1 = require("zod");
exports.reviewApprovalSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED', 'QUERIED', 'UNDER_REVIEW']),
    queryComment: zod_1.z.string().optional(),
    officerNotes: zod_1.z.string().optional(),
});
exports.resolveRiskSchema = zod_1.z.object({
    isResolved: zod_1.z.boolean().default(true),
    resolutionNotes: zod_1.z.string().optional(),
});
