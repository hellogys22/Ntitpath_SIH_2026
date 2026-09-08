"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
class ComplianceService {
    static async getApplicationCompliances(applicationId) {
        return client_1.default.complianceItem.findMany({
            where: { applicationId },
            orderBy: { dueDate: 'asc' },
        });
    }
    static async updateComplianceStatus(complianceId, status, lastFiledDate) {
        return client_1.default.complianceItem.update({
            where: { id: complianceId },
            data: {
                status,
                lastFiledDate: lastFiledDate ? new Date(lastFiledDate) : new Date(),
            },
        });
    }
}
exports.ComplianceService = ComplianceService;
