"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
class CopilotService {
    static async query(applicationId, question) {
        const q = question.toLowerCase();
        const application = await client_1.default.application.findUnique({
            where: { id: applicationId },
            include: {
                business: true,
                approvals: true,
                documents: true,
                riskItems: true,
                complianceItems: true,
            },
        });
        if (!application) {
            throw new Error('Application context not found');
        }
        // Context-driven reasoning responses
        if (q.includes('timeline') || q.includes('how long') || q.includes('days') || q.includes('sla')) {
            return {
                reply: `Based on your ${application.business.sector} setup (${application.business.investmentCr} Cr investment in Raipur), your sequential linear timeline is ~135 days. However, with NitiPath's DAG Parallel Track optimization, your projected timeline is **${application.estimatedDays} days**.\n\nKey Critical Path milestones:\n1. Land Allotment & Lease Deed (15-20 days)\n2. CECB Consent to Establish (22-30 days)\n3. Building & DISH Factory Plan (20 days)\n4. Final Consent to Operate (20 days).`,
                sources: ['Chhattisgarh Industrial Policy 2024-2029', 'CECB Citizen Charter'],
                recommendedActions: ['Run Fire NOC and HT Power feasibility concurrently in Track B.'],
            };
        }
        if (q.includes('risk') || q.includes('mismatch') || q.includes('reject') || q.includes('delay') || q.includes('area')) {
            const mismatch = application.documents.find((d) => d.status === 'MISMATCH_DETECTED');
            return {
                reply: mismatch
                    ? `⚠️ **High Risk Inconsistency Detected**: Your Detailed Project Report (DPR) mentions **12,500 sq ft** built-up area while the Master Site Plan drawing is drafted for **10,000 sq ft**.\n\nThis is the #1 reason for scrutiny objection by CECB and DISH inspectors. Aligning DPR Section 4.2 with your latest CAD drawing will prevent an estimated 15-20 days delay.`
                    : `Your project currently has **${application.riskLevel} risk level** with no critical cross-document discrepancies detected.`,
                sources: ['Pre-Submission Cross-Document Audit Engine', 'CECB Environmental Rules'],
                recommendedActions: ['Re-upload corrected DPR Section 4.2', 'Verify equipment floor plan'],
            };
        }
        if (q.includes('subsidy') || q.includes('grant') || q.includes('incentive') || q.includes('scheme')) {
            return {
                reply: `For your ${application.business.sector} unit in Chhattisgarh with ₹${application.business.investmentCr} Cr capital expenditure, you qualify for:\n\n1. **PMKSY / MoFPI Capital Subsidy**: Up to 35% on eligible plant & machinery (Estimated ₹${(application.business.investmentCr * 0.35).toFixed(2)} Cr).\n2. **CG Industrial Policy 2024 Interest Subvention**: 5% interest subsidy for 5 years on term loans.\n3. **Stamp Duty & Electricity Duty Exemption**: 100% exemption for the first 7 years.`,
                sources: ['Chhattisgarh Industrial Policy 2024-2029', 'PM Kisan SAMPADA Yojana'],
                recommendedActions: ['Download Scheme Eligibility Checklist from the Schemes tab.'],
            };
        }
        if (q.includes('document') || q.includes('upload') || q.includes('cte') || q.includes('fssai')) {
            return {
                reply: `For CECB Consent to Establish (CTE - Orange Category) and FSSAI Manufacturing License, you need:\n\n• Detailed Project Report (DPR) with process flow\n• Site Layout Master Plan (with greenbelt 33% demarcation)\n• ETP/STP design schematics with zero liquid discharge (ZLD) plan\n• Water Potability Certificate (IS 10500 compliant)\n• FSMS Plan & HACCP documentation.`,
                sources: ['CECB Guidelines', 'FSSAI Act 2006'],
                recommendedActions: ['Ensure ETP capacity matches DPR daily effluent output.'],
            };
        }
        return {
            reply: `NitiPath Intelligence Copilot is actively tracking application **${application.applicationNumber}** (${application.projectTitle}). You have completed ${application.completedApprovals} of ${application.totalApprovals} clearances with an overall Readiness Score of **${application.readinessScore}%**.\n\nAsk me about required documents, SLA timelines, DG set clearances, or parallel track acceleration.`,
            sources: ['NitiPath Knowledge Graph', 'Chhattisgarh Single Window System'],
            recommendedActions: ['Review Next Best Action on your dashboard.'],
        };
    }
}
exports.CopilotService = CopilotService;
