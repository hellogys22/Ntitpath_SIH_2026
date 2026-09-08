"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
const env_1 = require("../config/env");
const audit_service_1 = require("./audit.service");
class AuthService {
    static async register(input, ipAddress, userAgent) {
        const existing = await client_1.default.user.findUnique({
            where: { email: input.email },
        });
        if (existing) {
            throw new Error('User with this email already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 10);
        const user = await client_1.default.user.create({
            data: {
                email: input.email,
                password: hashedPassword,
                name: input.name,
                role: input.role || 'BUSINESS_USER',
                department: input.department,
                phone: input.phone,
            },
        });
        await audit_service_1.AuditService.log({
            userId: user.id,
            action: 'USER_REGISTERED',
            details: `User registered with role ${user.role}`,
            ipAddress,
            userAgent,
        });
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                phone: user.phone,
            },
            token,
        };
    }
    static async login(input, ipAddress, userAgent) {
        const user = await client_1.default.user.findUnique({
            where: { email: input.email },
            include: {
                businesses: {
                    include: {
                        applications: true,
                    },
                },
            },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcryptjs_1.default.compare(input.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        await audit_service_1.AuditService.log({
            userId: user.id,
            action: 'USER_LOGIN',
            details: `User logged in from role ${user.role}`,
            ipAddress,
            userAgent,
        });
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                phone: user.phone,
                businesses: user.businesses,
            },
            token,
        };
    }
    static async getMe(userId) {
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                phone: true,
                createdAt: true,
                businesses: {
                    include: {
                        applications: {
                            include: {
                                approvals: true,
                                riskItems: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, {
            expiresIn: env_1.ENV.JWT_EXPIRES_IN,
        });
    }
}
exports.AuthService = AuthService;
