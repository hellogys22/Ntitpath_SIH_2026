import { Router } from 'express';
import { CopilotController } from '../controllers/copilot.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/query', CopilotController.query);

export default router;
