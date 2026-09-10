import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { ENV } from '../config/env';
import { AuditService } from './audit.service';
import { EmailService } from './email.service';
import { AuthUserPayload } from '../types';

interface SendOtpOptions {
  email: string;
  type: 'business' | 'officer';
  ipAddress?: string;
  userAgent?: string;
}

interface VerifyOtpOptions {
  email: string;
  otp: string;
  type: 'business' | 'officer';
  companyName?: string;
  mobile?: string;
  password?: string;
  department?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface VerifySessionOptions {
  accessToken: string;
  type: 'business' | 'officer';
  companyName?: string;
  mobile?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class OtpService {
  // Rate-limiting map: email -> array of timestamp (milliseconds)
  // Window: 60 minutes (3600 seconds), Max requests: 5
  private static rateLimitMap = new Map<string, number[]>();
  private static readonly RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private static readonly MAX_REQUESTS_PER_WINDOW = 5;

  /**
   * Enforces server-side rate limit per email.
   * In non-production, bypasses for evaluation demo accounts and allows generous testing allowance.
   */
  public static checkRateLimit(email: string): { allowed: boolean; retryAfterSeconds: number } {
    const normalized = email.trim().toLowerCase();

    // Demo evaluation accounts bypass rate limits in non-production environments
    const isDemoAccount = normalized === 'business@demo.com' || normalized === 'epcb.officer@cg.gov.in';
    if (isDemoAccount && process.env.NODE_ENV !== 'production') {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const now = Date.now();
    const timestamps = this.rateLimitMap.get(normalized) || [];

    // Filter out timestamps outside the sliding window
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

  /**
   * Clears the rate limiter for a specific email or all emails (dev/test utility).
   */
  public static clearRateLimit(email?: string): void {
    if (email) {
      this.rateLimitMap.delete(email.trim().toLowerCase());
    } else {
      this.rateLimitMap.clear();
    }
  }

  /**
   * Records an OTP attempt against the rate limiter.
   */
  private static recordRateLimitAttempt(email: string): void {
    const normalized = email.trim().toLowerCase();
    const timestamps = this.rateLimitMap.get(normalized) || [];
    timestamps.push(Date.now());
    this.rateLimitMap.set(normalized, timestamps);
  }

  /**
   * Sends an OTP via Supabase's built-in Auth service.
   */
  public static async sendOtp(options: SendOtpOptions) {
    const email = options.email.trim().toLowerCase();

    // 1. Check server-side rate limit
    const rateCheck = this.checkRateLimit(email);
    if (!rateCheck.allowed) {
      const error: any = new Error(
        `Rate limit exceeded. Maximum 5 verification codes per hour. Please wait ${Math.ceil(
          rateCheck.retryAfterSeconds / 60
        )} minutes before requesting again.`
      );
      error.status = 429;
      error.retryAfter = rateCheck.retryAfterSeconds;
      throw error;
    }

    // 2. Pre-authorization check for Officer accounts
    if (options.type === 'officer') {
      const officer = await prisma.officer.findFirst({
        where: {
          email: { equals: email },
          isActive: true,
        },
      });

      // Anti-enumeration protection:
      // If email is NOT pre-authorized, return a generic success message to prevent user enumeration,
      // but do NOT send any OTP and write a security audit log.
      if (!officer) {
        this.recordRateLimitAttempt(email);
        await AuditService.log({
          action: 'OFFICER_OTP_REJECTED_UNAUTHORIZED',
          details: `Unauthorized attempt to request government portal OTP for unlisted email: ${email}`,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
        });

        return {
          success: true,
          message: 'If this email is registered as an authorized official, a verification code has been sent.',
          stealth: true,
        };
      }

      // Record rate limit attempt for authorized officer
      this.recordRateLimitAttempt(email);

      await AuditService.log({
        action: 'OFFICER_OTP_REQUESTED',
        details: `Government OTP requested for official: ${officer.name} (${officer.department})`,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      });

      return await this.dispatchSupabaseOtp(email, false);
    }

    // 3. Business Owner Flow
    this.recordRateLimitAttempt(email);

    await AuditService.log({
      action: 'BUSINESS_OTP_REQUESTED',
      details: `Business registration OTP requested for ${email}`,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });

    return await this.dispatchSupabaseOtp(email, true);
  }

  /**
   * Internal helper to dispatch Supabase built-in email OTP.
   * Handles Supabase free-tier SMTP fallback seamlessly via admin.generateLink.
   */
  private static async dispatchSupabaseOtp(email: string, shouldCreateUser: boolean) {
    if (!supabaseAdmin && !supabaseAnon) {
      throw new Error('Supabase client is not configured on the server.');
    }

    let devOtp: string | undefined;
    let magicLink: string | undefined;
    let codeLength = 6;

    try {
      // Primary: Call Supabase signInWithOtp
      const client = supabaseAnon || supabaseAdmin!;
      const otpRes = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser,
        },
      });

      if (otpRes.error) {
        // If Supabase free tier rate-limit kicks in on email delivery,
        // use admin.generateLink to generate the authentic Supabase OTP token
        if (
          otpRes.error.message.includes('rate limit') ||
          otpRes.error.message.includes('over_email_send_rate_limit') ||
          otpRes.error.status === 429
        ) {
          if (supabaseAdmin) {
            const linkRes = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email,
            });

            if (linkRes.data?.properties?.email_otp) {
              devOtp = linkRes.data.properties.email_otp;
              magicLink = linkRes.data.properties.action_link;
              codeLength = devOtp.length;
            }
          } else {
            throw otpRes.error;
          }
        } else {
          throw otpRes.error;
        }
      } else if (!devOtp && supabaseAdmin && process.env.NODE_ENV !== 'production') {
        try {
          const linkRes = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
          });
          if (linkRes.data?.properties?.email_otp) {
            devOtp = linkRes.data.properties.email_otp;
            magicLink = linkRes.data.properties.action_link;
            codeLength = devOtp.length;
          }
        } catch (linkErr) {
          // Keep normal behavior if generateLink throws
        }
      }
    } catch (err: any) {
      // Fallback with admin client if standard send fails
      if (supabaseAdmin) {
        const linkRes = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        });
        if (linkRes.data?.properties?.email_otp) {
          devOtp = linkRes.data.properties.email_otp;
          magicLink = linkRes.data.properties.action_link;
          codeLength = devOtp.length;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    // Always dispatch real email containing the genuine Supabase OTP to the recipient's inbox
    let emailSent = false;
    if (devOtp) {
      try {
        const emailRes = await EmailService.sendOtpEmail({
          to: email,
          otp: devOtp,
          type: shouldCreateUser ? 'business' : 'officer',
          magicLink,
        });
        emailSent = emailRes.sent;
      } catch (e: any) {
        console.warn(`[OtpService] Email dispatch caught error:`, e.message);
      }
    }

    return {
      success: true,
      message: emailSent
        ? `Verification code delivered to ${email}. Please check your inbox.`
        : `We sent a ${codeLength}-digit code to ${email}`,
      devOtp: process.env.NODE_ENV !== 'production' ? devOtp : undefined,
      codeLength,
      emailSent,
    };
  }

  /**
   * Verifies the 6-digit OTP code using Supabase's built-in verifyOtp.
   * Validates email_confirmed_at and enforces role isolation.
   */
  public static async verifyOtp(options: VerifyOtpOptions) {
    const email = options.email.trim().toLowerCase();
    const token = options.otp.trim();
    const client = supabaseAnon || supabaseAdmin;

    if (!client) {
      throw new Error('Supabase client is not configured.');
    }

    // Call Supabase built-in verifyOtp with type: 'email'
    const verifyRes = await client.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (verifyRes.error) {
      const errorMsg = verifyRes.error.message || 'Invalid or expired verification code.';
      const isExpired = errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid');

      if (options.type === 'officer') {
        await AuditService.log({
          action: 'OFFICER_LOGIN_FAILED',
          details: `Failed officer verification attempt for ${email}: ${errorMsg}`,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
        });
      }

      const error: any = new Error(errorMsg);
      error.status = 400;
      error.isExpired = isExpired;
      throw error;
    }

    const supabaseUser = verifyRes.data.user;
    if (!supabaseUser) {
      throw new Error('Verification failed: Supabase user profile not returned.');
    }

    // Server-side check: confirm user email is verified
    if (!supabaseUser.email_confirmed_at) {
      const error: any = new Error('Email verification incomplete. Your email has not been confirmed.');
      error.status = 403;
      throw error;
    }

    // Process role-specific fulfillment
    return await this.fulfillVerifiedUser({
      email,
      supabaseUser,
      type: options.type,
      companyName: options.companyName,
      mobile: options.mobile,
      department: options.department,
      supabaseSession: verifyRes.data.session,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });
  }

  /**
   * Server-side token validation: Verifies an existing Supabase access token,
   * enforces user.email_confirmed_at, and provisions the verified account.
   */
  public static async verifySupabaseSession(options: VerifySessionOptions) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured.');
    }

    const { data, error } = await supabaseAdmin.auth.getUser(options.accessToken);
    if (error || !data.user) {
      const err: any = new Error('Invalid or expired Supabase authentication session.');
      err.status = 401;
      throw err;
    }

    const supabaseUser = data.user;
    const email = (supabaseUser.email || '').trim().toLowerCase();

    // Server-side check: confirm user email is verified
    if (!supabaseUser.email_confirmed_at) {
      const err: any = new Error('Email verification incomplete: user.email_confirmed_at is null.');
      err.status = 403;
      throw err;
    }

    return await this.fulfillVerifiedUser({
      email,
      supabaseUser,
      type: options.type,
      companyName: options.companyName,
      mobile: options.mobile,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });
  }

  /**
   * Provisions User and Business/Officer records only after verified session exists.
   */
  private static async fulfillVerifiedUser(params: {
    email: string;
    supabaseUser: any;
    type: 'business' | 'officer';
    companyName?: string;
    mobile?: string;
    department?: string;
    supabaseSession?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { email, type } = params;

    // --- OFFICER FLOW ---
    if (type === 'officer') {
      const officer = await prisma.officer.findFirst({
        where: {
          email: { equals: email },
          isActive: true,
        },
      });

      if (!officer) {
        await AuditService.log({
          action: 'OFFICER_LOGIN_FAILED',
          details: `Pre-authorization check failed during verification for email: ${email}`,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });
        const err: any = new Error('Unauthorized government official account.');
        err.status = 403;
        throw err;
      }

      // Upsert local officer user
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: officer.name,
          role: 'DEPARTMENT_OFFICER',
          department: officer.department,
        },
        create: {
          email,
          name: officer.name,
          password: 'SSO_VERIFIED_OFFICER',
          role: 'DEPARTMENT_OFFICER',
          department: officer.department,
        },
      });

      // Track successful officer login in AuditLog
      await AuditService.log({
        userId: user.id,
        action: 'OFFICER_LOGIN_SUCCESS',
        details: `Official verified via OTP: ${officer.name} (${officer.department}) - Badge: ${officer.badgeNumber || 'N/A'}`,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      const token = this.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'ADMIN',
        department: user.department,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'admin',
          department: officer.department,
          designation: officer.designation,
          badgeNumber: officer.badgeNumber,
          emailConfirmedAt: params.supabaseUser.email_confirmed_at,
        },
        role: 'admin',
        token,
        supabaseSession: params.supabaseSession,
      };
    }

    // --- BUSINESS OWNER FLOW ---
    // Ensure the user exists in database
    let user = await prisma.user.findUnique({
      where: { email },
      include: { businesses: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: params.companyName || email.split('@')[0],
          password: 'SSO_VERIFIED_BUSINESS',
          role: 'BUSINESS_USER',
          phone: params.mobile,
        },
        include: { businesses: true },
      });
    }

    // Create business profile ONLY after verified session exists
    let business = user.businesses?.[0];
    if (!business) {
      business = await prisma.business.create({
        data: {
          userId: user.id,
          name: params.companyName || 'Enterprise Manufacturing Unit',
          entityType: 'Private Limited',
          address: 'Plot No. 42, Industrial Growth Centre, Urla',
          city: 'Raipur',
          state: 'Chhattisgarh',
          sector: 'Food Processing',
          investmentCr: 12.5,
          employees: 50,
          landAcres: 5.0,
        },
      });
    }

    await AuditService.log({
      userId: user.id,
      action: 'BUSINESS_REGISTRATION_VERIFIED',
      details: `Enterprise owner email confirmed (${user.email}). Business profile ${business.name} activated.`,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'BUSINESS_USER',
      department: null,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'business',
        phone: user.phone,
        companyName: business.name,
        emailConfirmedAt: params.supabaseUser.email_confirmed_at,
      },
      business,
      role: 'business',
      token,
      supabaseSession: params.supabaseSession,
    };
  }

  private static generateToken(payload: AuthUserPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });
  }
}
