import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { AuditService } from './audit.service';
import { EmailService } from './email.service';

interface RequestPasswordResetOptions {
  email: string;
  redirectTo?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface CompletePasswordResetOptions {
  email: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string;
}

export class PasswordResetService {
  // Rate-limiting map: email -> array of timestamps (ms)
  // Window: 60 minutes, Max requests: 5
  private static rateLimitMap = new Map<string, number[]>();
  private static readonly RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private static readonly MAX_REQUESTS_PER_WINDOW = 5;

  /**
   * Enforces server-side rate limiting per email (max 5 requests/hour).
   */
  public static checkRateLimit(email: string): { allowed: boolean; retryAfterSeconds: number } {
    const normalized = email.trim().toLowerCase();
    const now = Date.now();
    const timestamps = this.rateLimitMap.get(normalized) || [];

    // Filter out timestamps outside the sliding 1-hour window
    const validTimestamps = timestamps.filter(t => now - t < this.RATE_LIMIT_WINDOW_MS);
    this.rateLimitMap.set(normalized, validTimestamps);

    if (validTimestamps.length >= this.MAX_REQUESTS_PER_WINDOW) {
      const oldest = validTimestamps[0];
      const retryAfterMs = this.RATE_LIMIT_WINDOW_MS - (now - oldest);
      const retryAfterSeconds = Math.ceil(Math.max(0, retryAfterMs) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  }

  private static recordRateLimitAttempt(email: string) {
    const normalized = email.trim().toLowerCase();
    const timestamps = this.rateLimitMap.get(normalized) || [];
    timestamps.push(Date.now());
    this.rateLimitMap.set(normalized, timestamps);
  }

  /**
   * Clears rate limits (for testing purposes).
   */
  public static resetRateLimits() {
    this.rateLimitMap.clear();
  }

  /**
   * Requests a password reset link for the given email via Supabase Auth.
   * Dispatches genuine recovery link and enforces anti-enumeration generic messaging.
   */
  public static async requestPasswordReset(options: RequestPasswordResetOptions) {
    const email = options.email.trim().toLowerCase();

    // 1. Enforce API route-level rate limiting
    const rateCheck = this.checkRateLimit(email);
    if (!rateCheck.allowed) {
      const error: any = new Error(
        `Rate limit exceeded. Maximum 5 password reset requests per hour. Please wait ${Math.ceil(
          rateCheck.retryAfterSeconds / 60
        )} minutes before requesting again.`
      );
      error.status = 429;
      error.retryAfter = rateCheck.retryAfterSeconds;
      throw error;
    }

    this.recordRateLimitAttempt(email);

    // 2. Default redirectTo URL pointing to client /reset-password
    const redirectTo = options.redirectTo || 'http://localhost:3000/reset-password';

    let devResetLink: string | undefined;

    // 3. Generate Supabase Auth recovery link using Supabase admin client
    if (supabaseAdmin) {
      try {
        const linkRes = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo,
          },
        });

        if (linkRes.data?.properties?.action_link) {
          devResetLink = linkRes.data.properties.action_link;

          // Dispatch email with official NitiPath template
          await EmailService.sendPasswordResetEmail({
            to: email,
            resetLink: devResetLink,
          });
        }
      } catch (err: any) {
        console.warn(`[PasswordResetService] generateLink note for ${email}:`, err.message);
      }
    }

    // 4. Also trigger built-in Supabase client resetPasswordForEmail
    try {
      const client = supabaseAnon || supabaseAdmin;
      if (client) {
        await client.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
      }
    } catch (e: any) {
      console.warn(`[PasswordResetService] resetPasswordForEmail dispatch note:`, e.message);
    }

    // 5. Log audit event
    await AuditService.log({
      action: 'PASSWORD_RESET_REQUESTED',
      details: `Password reset requested for email: ${email}`,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });

    // 6. Generic confirmation message: Always return generic response to avoid leaking registered emails
    return {
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
      devResetLink: process.env.NODE_ENV !== 'production' ? devResetLink : undefined,
    };
  }

  /**
   * Updates the password in the local Prisma database so that both Supabase Auth
   * and traditional password login authenticate with the newly chosen password.
   */
  public static async completePasswordReset(options: CompletePasswordResetOptions) {
    const email = options.email.trim().toLowerCase();
    const { newPassword } = options;

    if (!newPassword || newPassword.length < 6) {
      const error: any = new Error('Password must be at least 6 characters.');
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update existing user or upsert
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });
    }

    await AuditService.log({
      userId: user?.id,
      action: 'PASSWORD_RESET_COMPLETED',
      details: `Password reset successfully completed for email: ${email}`,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });

    return {
      success: true,
      message: 'Password updated successfully. You may now sign in with your new credentials.',
    };
  }
}
