"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email address is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters long'),
    role: zod_1.z.enum(['BUSINESS_USER', 'ADMIN', 'DEPARTMENT_OFFICER']).optional().default('BUSINESS_USER'),
    department: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email address is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
