import { Router } from 'express';
import authRoutes from './auth.routes';
import businessRoutes from './business.routes';
import applicationRoutes from './application.routes';
import documentRoutes from './document.routes';
import complianceRoutes from './compliance.routes';
import adminRoutes from './admin.routes';
import copilotRoutes from './copilot.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/businesses', businessRoutes);
router.use('/applications', applicationRoutes);
router.use('/documents', documentRoutes);
router.use('/compliance', complianceRoutes);
router.use('/support', complianceRoutes);
router.use('/admin', adminRoutes);
router.use('/copilot', copilotRoutes);

export default router;
