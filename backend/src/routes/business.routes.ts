import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createBusinessSchema, updateBusinessSchema } from '../validators/business.validator';

const router = Router();

router.use(authenticateJwt);

router.post('/', validateRequest(createBusinessSchema), BusinessController.createBusiness);
router.get('/profile', BusinessController.getProfile);
router.put('/profile', validateRequest(updateBusinessSchema), BusinessController.updateProfile);
router.get('/my', BusinessController.getMyBusinesses);
router.get('/:id', BusinessController.getBusinessById);
router.put('/:id', validateRequest(updateBusinessSchema), BusinessController.updateBusiness);

export default router;
