"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const audit_service_1 = require("./audit.service");
class BusinessService {
    static async createBusiness(userId, input) {
        const business = await client_1.default.business.create({
            data: {
                userId,
                name: input.name,
                entityType: input.entityType,
                pan: input.pan,
                gstin: input.gstin,
                address: input.address,
                city: input.city,
                state: input.state,
                pinCode: input.pinCode,
                sector: input.sector,
                investmentCr: input.investmentCr,
                employees: input.employees,
                landAcres: input.landAcres,
                builtUpAreaSqFt: input.builtUpAreaSqFt || 10000,
                powerRequirementKw: input.powerRequirementKw || 250,
                waterRequirementKld: input.waterRequirementKld || 50,
            },
            include: { applications: true },
        });
        await audit_service_1.AuditService.log({
            userId,
            action: 'BUSINESS_CREATED',
            details: `Created business entity: ${business.name} (${business.sector})`,
        });
        return business;
    }
    static async getBusinessesByUser(userId) {
        return client_1.default.business.findMany({
            where: { userId },
            include: {
                applications: {
                    include: {
                        approvals: true,
                        riskItems: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getBusinessById(businessId, userId) {
        const whereClause = { id: businessId };
        if (userId)
            whereClause.userId = userId;
        const business = await client_1.default.business.findFirst({
            where: whereClause,
            include: {
                applications: {
                    include: {
                        approvals: true,
                        documents: true,
                        riskItems: true,
                        complianceItems: true,
                    },
                },
            },
        });
        if (!business) {
            throw new Error('Business not found or unauthorized access');
        }
        return business;
    }
    static async updateBusiness(businessId, userId, input) {
        const existing = await client_1.default.business.findFirst({
            where: { id: businessId, userId },
        });
        if (!existing) {
            throw new Error('Business not found or unauthorized');
        }
        const updated = await client_1.default.business.update({
            where: { id: businessId },
            data: input,
        });
        await audit_service_1.AuditService.log({
            userId,
            action: 'BUSINESS_UPDATED',
            details: `Updated business profile for ${updated.name}`,
        });
        return updated;
    }
}
exports.BusinessService = BusinessService;
