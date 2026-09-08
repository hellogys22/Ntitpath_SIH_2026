"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const dependencyRules_1 = require("../rules/dependencyRules");
class DependencyService {
    static async getApplicationGraph(applicationId) {
        const application = await client_1.default.application.findUnique({
            where: { id: applicationId },
            include: {
                approvals: {
                    include: {
                        documents: true,
                    },
                },
            },
        });
        if (!application) {
            throw new Error('Application not found');
        }
        const nodes = application.approvals.map((appr) => {
            let dependencies = [];
            try {
                if (appr.dependenciesJson)
                    dependencies = JSON.parse(appr.dependenciesJson);
            }
            catch (e) { }
            return {
                code: appr.approvalCode,
                name: appr.name,
                department: appr.department,
                stage: appr.stage,
                slaDays: appr.slaDays,
                isCriticalPath: appr.isCriticalPath,
                status: appr.status,
                dependencies,
                parallelGroup: appr.parallelGroupId || 'GENERAL',
            };
        });
        const dagResult = (0, dependencyRules_1.computeDependencyGraph)(nodes);
        // Identify current bottlenecks
        const bottlenecks = application.approvals
            .filter((appr) => appr.status === 'QUERIED' || (appr.isCriticalPath && appr.status !== 'APPROVED'))
            .map((appr) => ({
            approvalCode: appr.approvalCode,
            name: appr.name,
            department: appr.department,
            stage: appr.stage,
            status: appr.status,
            isCriticalPath: appr.isCriticalPath,
            slaDays: appr.slaDays,
            delayReason: appr.status === 'QUERIED'
                ? appr.queryComment || 'Department raised a statutory query'
                : 'Pre-requisite for downstream approvals on Critical Path',
        }));
        return {
            applicationId: application.id,
            applicationNumber: application.applicationNumber,
            totalApprovals: nodes.length,
            criticalPathNodes: dagResult.criticalPath,
            totalCriticalPathDays: dagResult.totalCriticalPathDays,
            parallelTracks: dagResult.parallelTracks,
            bottlenecks,
            topologicalOrder: dagResult.sortedNodes,
        };
    }
}
exports.DependencyService = DependencyService;
