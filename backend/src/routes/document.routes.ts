import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { enforceDemoIsolation } from '../middleware/demoIsolation.middleware';

const router = Router();

// All document routes require authentication and are guarded by demo isolation
router.use(authenticateJwt);
router.use(enforceDemoIsolation);

router.post('/upload', upload.single('file'), DocumentController.uploadDocument);
router.get('/application/:applicationId', DocumentController.getDocuments);
router.get('/:id/analyze', DocumentController.analyzeDocument);
router.get('/:id/download', DocumentController.downloadDocument);
router.get('/:id/signed-url', DocumentController.getSignedUrl);
router.get('/application/:applicationId/consistency-audit', DocumentController.runConsistencyAudit);
router.post('/:id/resolve-mismatch', DocumentController.resolveMismatch);

export default router;
