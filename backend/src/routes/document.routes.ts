import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/upload', upload.single('file'), DocumentController.uploadDocument);
router.get('/application/:applicationId', DocumentController.getDocuments);
router.get('/:id/analyze', DocumentController.analyzeDocument);
router.get('/application/:applicationId/consistency-audit', DocumentController.runConsistencyAudit);
router.post('/:id/resolve-mismatch', DocumentController.resolveMismatch);

export default router;
