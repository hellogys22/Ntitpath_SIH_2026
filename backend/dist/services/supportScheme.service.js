"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportSchemeService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
class SupportSchemeService {
    static async getMatchingSchemes(sector, investmentCr) {
        const allSchemes = await client_1.default.supportScheme.findMany({
            where: { status: 'ACTIVE' },
        });
        return allSchemes.map((scheme) => {
            let isEligible = true;
            let reason = 'Directly matches your sector and MSME scale.';
            if (scheme.sector !== 'ALL' && !scheme.sector.toLowerCase().includes(sector.toLowerCase())) {
                isEligible = false;
                reason = `Specific to ${scheme.sector} sector.`;
            }
            const estimatedSubsidy = Math.min(scheme.maxCapCr, (investmentCr * scheme.subsidyPercentage) / 100);
            return {
                ...scheme,
                isEligible,
                eligibilityReason: reason,
                estimatedSubsidyAmountCr: Number(estimatedSubsidy.toFixed(2)),
            };
        });
    }
}
exports.SupportSchemeService = SupportSchemeService;
