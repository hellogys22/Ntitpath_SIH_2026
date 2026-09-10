import { Request, Response, NextFunction } from 'express';
import { PasswordResetService } from '../services/password-reset.service';

export class PasswordResetController {
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, redirectTo } = req.body;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.status(400).json({
          success: false,
          message: 'Please enter a valid email address format (e.g. enterprise@company.com).',
        });
        return;
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await PasswordResetService.requestPasswordReset({
        email,
        redirectTo,
        ipAddress,
        userAgent,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          devResetLink: result.devResetLink,
        },
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

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Email and new password are required.',
        });
        return;
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters.',
        });
        return;
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await PasswordResetService.completePasswordReset({
        email,
        newPassword,
        ipAddress,
        userAgent,
      });

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async resetRateLimit(_req: Request, res: Response) {
    PasswordResetService.resetRateLimits();
    res.status(200).json({
      success: true,
      message: 'Password reset rate limits cleared.',
    });
  }
}
