import { Request, Response, NextFunction } from 'express';
import { OtpService } from '../services/otp.service';

export class OtpController {
  /**
   * POST /api/auth/otp/send
   * Body: { email: string, type: 'business' | 'officer' }
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type } = req.body;
      if (!email || !type) {
        res.status(400).json({
          success: false,
          message: 'Email and login type (business or officer) are required.',
        });
        return;
      }

      const result = await OtpService.sendOtp({
        email,
        type,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      if (error.status === 429) {
        res.status(429).json({
          success: false,
          message: error.message,
          retryAfter: error.retryAfter,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/otp/verify
   * Body: { email, otp, type, companyName?, mobile?, department? }
   */
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, type, companyName, mobile, department } = req.body;
      if (!email || !otp || !type) {
        res.status(400).json({
          success: false,
          message: 'Email, OTP code, and type are required.',
        });
        return;
      }

      const result = await OtpService.verifyOtp({
        email,
        otp,
        type,
        companyName,
        mobile,
        department,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        message: 'OTP verification successful.',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || 'OTP verification failed.',
        isExpired: error.isExpired || false,
      });
    }
  }

  /**
   * POST /api/auth/otp/verify-session
   * Body: { accessToken, type, companyName?, mobile? }
   */
  static async verifySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, type, companyName, mobile } = req.body;
      if (!accessToken || !type) {
        res.status(400).json({
          success: false,
          message: 'Supabase access token and type are required.',
        });
        return;
      }

      const result = await OtpService.verifySupabaseSession({
        accessToken,
        type,
        companyName,
        mobile,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        message: 'Session verified successfully.',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || 401).json({
        success: false,
        message: error.message || 'Session verification failed.',
      });
    }
  }
}
