"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const plan_service_1 = require("../services/plan.service");
const dependency_service_1 = require("../services/dependency.service");
const risk_service_1 = require("../services/risk.service");
const readiness_service_1 = require("../services/readiness.service");
const nextAction_service_1 = require("../services/nextAction.service");
const document_service_1 = require("../services/document.service");
const supportScheme_service_1 = require("../services/supportScheme.service");
class ApplicationController {
    static async createApplication(req, res, next) {
        try {
            const { businessId, projectTitle, description, pollutionCategory } = req.body;
            const application = await plan_service_1.PlanService.generateApplicationPlan(businessId, projectTitle, description, pollutionCategory, req.user?.id);
            res.status(201).json({
                success: true,
                message: 'Application and dynamic approval roadmap created successfully',
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getApplicationDashboard(req, res, next) {
        try {
            const { id } = req.params;
            const application = await client_1.default.application.findUnique({
                where: { id },
                include: {
                    business: true,
                    approvals: {
                        include: { documents: true },
                        orderBy: [{ stage: 'asc' }, { slaDays: 'asc' }],
                    },
                    documents: true,
                    riskItems: true,
                    complianceItems: { orderBy: { dueDate: 'asc' } },
                },
            });
            if (!application) {
                res.status(404).json({ success: false, message: 'Application not found' });
                return;
            }
            // Concurrently run intelligence engines
            const [dependencyGraph, riskAnalysis, readiness, nextAction, consistencyAudit, matchingSchemes] = await Promise.all([
                dependency_service_1.DependencyService.getApplicationGraph(id),
                risk_service_1.RiskService.evaluateApplicationRisk(id),
                readiness_service_1.ReadinessService.calculateReadiness(id),
                nextAction_service_1.NextActionService.getNextBestAction(id),
                document_service_1.DocumentService.runConsistencyAudit(id),
                supportScheme_service_1.SupportSchemeService.getMatchingSchemes(application.business.sector, application.business.investmentCr),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    application,
                    intelligence: {
                        dependencyGraph,
                        riskAnalysis,
                        readiness,
                        nextAction,
                        consistencyAudit,
                        matchingSchemes,
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getApprovals(req, res, next) {
        try {
            const { id } = req.params;
            const approvals = await client_1.default.approval.findMany({
                where: { applicationId: id },
                include: { documents: true },
                orderBy: [{ stage: 'asc' }, { slaDays: 'asc' }],
            });
            res.status(200).json({
                success: true,
                data: approvals,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDependencyGraph(req, res, next) {
        try {
            const { id } = req.params;
            const graph = await dependency_service_1.DependencyService.getApplicationGraph(id);
            res.status(200).json({
                success: true,
                data: graph,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRisks(req, res, next) {
        try {
            const { id } = req.params;
            const risks = await risk_service_1.RiskService.getRisksByApplication(id);
            res.status(200).json({
                success: true,
                data: risks,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getApplications(req, res, next) {
        try {
            const userId = req.user?.id;
            const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'DEPARTMENT_OFFICER';
            const whereClause = {};
            if (!isAdmin && userId) {
                whereClause.business = { userId };
            }
            const applications = await client_1.default.application.findMany({
                where: whereClause,
                include: {
                    business: true,
                    approvals: true,
                    riskItems: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            res.status(200).json({
                success: true,
                data: applications,
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
                    complianceItems: { orderBy: { dueDate: 'asc' } },
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
    static async getBottleneck(req, res, next) {
        try {
            const { id } = req.params;
            const graph = await dependency_service_1.DependencyService.getApplicationGraph(id);
            const topBottleneck = graph.bottlenecks.length > 0 ? graph.bottlenecks[0] : null;
            res.status(200).json({
                success: true,
                data: {
                    bottlenecks: graph.bottlenecks,
                    primaryBottleneck: topBottleneck,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async recalculateRisk(req, res, next) {
        try {
            const { id } = req.params;
            const evaluation = await risk_service_1.RiskService.evaluateApplicationRisk(id);
            const readiness = await readiness_service_1.ReadinessService.calculateReadiness(id);
            res.status(200).json({
                success: true,
                message: 'Risk and readiness recalculated from latest database state',
                data: {
                    risk: evaluation,
                    readiness,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getNextAction(req, res, next) {
        try {
            const { id } = req.params;
            const nextAction = await nextAction_service_1.NextActionService.getNextBestAction(id);
            res.status(200).json({
                success: true,
                data: nextAction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getCompliance(req, res, next) {
        try {
            const { id } = req.params;
            const items = await client_1.default.complianceItem.findMany({
                where: { applicationId: id },
                orderBy: { dueDate: 'asc' },
            });
            res.status(200).json({
                success: true,
                data: items,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ApplicationController = ApplicationController;
