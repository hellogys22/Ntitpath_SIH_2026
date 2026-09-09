import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createApplicationSchema } from '../validators/application.validator';
import { enforceDemoIsolation } from '../middleware/demoIsolation.middleware';

const router = Router();

router.use(authenticateJwt);
router.use(enforceDemoIsolation);

router.get('/', ApplicationController.getApplications);
router.post('/', validateRequest(createApplicationSchema), ApplicationController.createApplication);
router.get('/:id', ApplicationController.getApplicationById);
router.get('/:id/dashboard', ApplicationController.getApplicationDashboard);
router.get('/:id/approvals', ApplicationController.getApprovals);
router.get('/:id/graph', ApplicationController.getDependencyGraph);
router.get('/:id/dependencies', ApplicationController.getDependencyGraph);
router.get('/:id/bottleneck', ApplicationController.getBottleneck);
router.get('/:id/risks', ApplicationController.getRisks);
router.post('/:id/recalculate-risk', ApplicationController.recalculateRisk);
router.get('/:id/next-action', ApplicationController.getNextAction);
router.get('/:id/compliance', ApplicationController.getCompliance);

export default router;
