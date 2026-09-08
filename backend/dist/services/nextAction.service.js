"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextActionService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
class NextActionService {
    static async getNextBestAction(applicationId) {
        const application = await client_1.default.application.findUnique({
            where: { id: applicationId },
            include: {
                approvals: true,
                documents: true,
                riskItems: true,
            },
        });
        if (!application) {
            throw new Error('Application not found');
        }
        // Priority 1: High severity document mismatch
        const mismatchDoc = application.documents.find((d) => d.status === 'MISMATCH_DETECTED');
        if (mismatchDoc) {
            return {
                priority: 'CRITICAL',
                title: 'Synchronize Built-up Area Discrepancy (DPR vs Site Layout)',
                category: 'DOCUMENT_CORRECTION',
                description: 'DPR cites 12,500 sq ft while Master Site Plan Layout shows 10,000 sq ft. Resolve this prior to submitting CTE application to CECB.',
                actionType: 'RESOLVE_DOCUMENT_MISMATCH',
                targetId: mismatchDoc.id,
                targetName: mismatchDoc.name,
                estimatedTimeSaved: '15-20 Days delay avoided',
                impact: 'Prevents statutory rejection from Pollution Control Board',
            };
        }
        // Priority 2: Queried Approval
        const queriedApproval = application.approvals.find((a) => a.status === 'QUERIED');
        if (queriedApproval) {
            return {
                priority: 'HIGH',
                title: `Respond to Statutory Query: ${queriedApproval.name}`,
                category: 'QUERY_RESPONSE',
                description: queriedApproval.queryComment || 'Department has requested additional technical clarifications.',
                actionType: 'RESPOND_QUERY',
                targetId: queriedApproval.id,
                targetName: queriedApproval.name,
                estimatedTimeSaved: '7 Days SLA pause resumed',
                impact: 'Required to unblock downstream approval pipeline',
            };
        }
        // Priority 3: Next Critical Path Approval needing submission
        const criticalPending = application.approvals.find((a) => a.isCriticalPath && (a.status === 'NOT_STARTED' || a.status === 'PENDING_DOCS'));
        if (criticalPending) {
            return {
                priority: 'HIGH',
                title: `Initiate Application for ${criticalPending.name}`,
                category: 'APPROVAL_SUBMISSION',
                description: `This approval is on the Critical Path with SLA of ${criticalPending.slaDays} days under ${criticalPending.department}.`,
                actionType: 'SUBMIT_APPROVAL',
                targetId: criticalPending.id,
                targetName: criticalPending.name,
                estimatedTimeSaved: 'On schedule',
                impact: 'Maintains optimal 65-day commissioning timeline',
            };
        }
        // Priority 4: Parallel track opportunity
        const parallelOpportunity = application.approvals.find((a) => !a.isCriticalPath && a.status === 'NOT_STARTED');
        if (parallelOpportunity) {
            return {
                priority: 'MEDIUM',
                title: `Launch Parallel Track: ${parallelOpportunity.name}`,
                category: 'PARALLEL_EXECUTION',
                description: `Can be executed simultaneously under ${parallelOpportunity.department} without waiting for critical path clearances.`,
                actionType: 'SUBMIT_APPROVAL',
                targetId: parallelOpportunity.id,
                targetName: parallelOpportunity.name,
                estimatedTimeSaved: '12 Days saved via parallel processing',
                impact: 'Accelerates overall factory commissioning',
            };
        }
        return {
            priority: 'LOW',
            title: 'Maintain Routine Compliance Monitoring',
            category: 'GENERAL_MONITORING',
            description: 'All primary clearances are in progress or approved. Monitor monthly compliance calendar.',
            actionType: 'VIEW_COMPLIANCE',
            targetId: application.id,
            targetName: application.projectTitle,
            estimatedTimeSaved: 'Nil',
            impact: 'Ongoing statutory adherence',
        };
    }
}
exports.NextActionService = NextActionService;
