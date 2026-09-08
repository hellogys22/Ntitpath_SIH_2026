"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const risk_service_1 = require("../services/risk.service");
const audit_service_1 = require("../services/audit.service");
const client_1 = __importDefault(require("../prisma/client"));
class AdminController {
    static async getDashboardAnalytics(req, res, next) {
        try {
            const analytics = await admin_service_1.AdminService.getDashboardAnalytics();
            res.status(200).json({
                success: true,
                data: analytics,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllApplications(req, res, next) {
        try {
            const { status, riskLevel, sector, search, page, limit } = req.query;
            const result = await admin_service_1.AdminService.getAllApplications({
                status: status,
                riskLevel: riskLevel,
                sector: sector,
                search: search,
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async reviewApproval(req, res, next) {
        try {
            const { id } = req.params;
            const { status, queryComment, officerNotes } = req.body;
            const officerId = req.user?.id;
            const updated = await admin_service_1.AdminService.reviewApproval(id, status, queryComment, officerNotes, officerId);
            res.status(200).json({
                success: true,
                message: `Approval status updated to ${status}`,
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async resolveRisk(req, res, next) {
        try {
            const { id } = req.params;
            const { resolutionNotes } = req.body;
            const resolved = await risk_service_1.RiskService.resolveRisk(id, resolutionNotes, req.user?.id);
            res.status(200).json({
                success: true,
                message: 'Risk item resolved successfully',
                data: resolved,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getApplicationById(req, res, next) {
        try {
            const { id } = req.params;
            const application = await client_1.default.application.findUnique({
                where: { id },
                include: {
                    business: true,
                    approvals: { include: { documents: true }, orderBy: [{ stage: 'asc' }, { slaDays: 'asc' }] },
                    documents: true,
                    riskItems: true,
                    complianceItems: true,
                    auditLogs: { include: { user: true }, orderBy: { createdAt: 'desc' } },
                },
            });
            if (!application) {
                res.status(404).json({ success: false, message: 'Application not found' });
                return;
            }
            res.status(200).json({
                success: true,
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllRisks(req, res, next) {
        try {
            const risks = await client_1.default.riskItem.findMany({
                include: {
                    application: { select: { id: true, applicationNumber: true, projectTitle: true } },
                    approval: { select: { id: true, approvalCode: true, name: true, department: true } },
                },
                orderBy: [{ isResolved: 'asc' }, { createdAt: 'desc' }],
            });
            res.status(200).json({
                success: true,
                data: risks,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllDocuments(req, res, next) {
        try {
            const documents = await client_1.default.document.findMany({
                include: {
                    application: { select: { id: true, applicationNumber: true, projectTitle: true } },
                    approval: { select: { id: true, approvalCode: true, name: true, department: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.status(200).json({
                success: true,
                data: documents,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAuditLogs(req, res, next) {
        try {
            const logs = await audit_service_1.AuditService.getRecentLogs(100);
            res.status(200).json({
                success: true,
                data: logs,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
