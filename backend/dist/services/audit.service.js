"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
class AuditService {
    static async log(params) {
        try {
            return await client_1.default.auditLog.create({
                data: {
                    userId: params.userId,
                    applicationId: params.applicationId,
                    action: params.action,
                    details: params.details,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                },
            });
        }
        catch (err) {
            console.error('Failed to write audit log:', err);
            return null;
        }
    }
    static async getLogsForApplication(applicationId) {
        return client_1.default.auditLog.findMany({
            where: { applicationId },
            include: { user: { select: { id: true, name: true, role: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    static async getRecentLogs(limit = 100) {
        return client_1.default.auditLog.findMany({
            include: {
                user: { select: { id: true, name: true, role: true, email: true } },
                application: { select: { id: true, applicationNumber: true, projectTitle: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
exports.AuditService = AuditService;
