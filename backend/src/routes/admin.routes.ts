import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireDepartmentOrAdmin } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { reviewApprovalSchema } from '../validators/admin.validator';

const router = Router();

router.use(authenticateJwt);
router.use(requireDepartmentOrAdmin);

router.get('/dashboard', AdminController.getDashboardAnalytics);
router.get('/applications', AdminController.getAllApplications);
router.get('/applications/:id', AdminController.getApplicationById);
router.get('/risks', AdminController.getAllRisks);
router.get('/documents', AdminController.getAllDocuments);
router.put('/approvals/:id/review', validateRequest(reviewApprovalSchema), AdminController.reviewApproval);
router.post('/risks/:id/resolve', AdminController.resolveRisk);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
