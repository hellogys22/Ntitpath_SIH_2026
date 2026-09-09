import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { OtpController } from '../controllers/otp.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

// Standard Password Auth (Backward-compatibility & Demo)
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/demo-reset', AuthController.demoReset);
router.get('/me', authenticateJwt, AuthController.getMe);

// Built-in Supabase Email OTP Auth & Rate-Limiting Endpoints
router.post('/otp/send', OtpController.sendOtp);
router.post('/otp/verify', OtpController.verifyOtp);
router.post('/otp/verify-session', OtpController.verifySession);

export default router;

