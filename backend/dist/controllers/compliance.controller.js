"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceController = void 0;
const compliance_service_1 = require("../services/compliance.service");
const supportScheme_service_1 = require("../services/supportScheme.service");
class ComplianceController {
    static async getCompliances(req, res, next) {
        try {
            const { applicationId } = req.params;
            const list = await compliance_service_1.ComplianceService.getApplicationCompliances(applicationId);
            res.status(200).json({
                success: true,
                data: list,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateComplianceStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, lastFiledDate } = req.body;
            const updated = await compliance_service_1.ComplianceService.updateComplianceStatus(id, status, lastFiledDate);
            res.status(200).json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSchemes(req, res, next) {
        try {
            const sector = req.query.sector || 'Food Processing';
            const investmentCr = parseFloat(req.query.investmentCr || '5.0');
            const schemes = await supportScheme_service_1.SupportSchemeService.getMatchingSchemes(sector, investmentCr);
            res.status(200).json({
                success: true,
                data: schemes,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ComplianceController = ComplianceController;
