import { Router } from 'express';
import { ComplianceController } from '../controllers/compliance.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/application/:applicationId', ComplianceController.getCompliances);
router.put('/:id/status', ComplianceController.updateComplianceStatus);
router.get('/schemes/match', ComplianceController.getSchemes);
router.get('/matches', ComplianceController.getSchemes);

export default router;
