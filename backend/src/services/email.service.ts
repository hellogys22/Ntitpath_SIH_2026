import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendOtpEmailOptions {
  to: string;
  otp: string;
  type: 'business' | 'officer';
  magicLink?: string;
  recipientName?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;
  private static initialized = false;

  /**
   * Initializes or gets the active Nodemailer transporter.
   */
  private static getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (!host || !user || !pass) {
      if (!this.initialized) {
        console.warn(
          '[NitiPath EmailService] Live SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured in .env. Live email delivery is pending SMTP setup.'
        );
        this.initialized = true;
      }
      return null;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false, // Prevents self-signed certificate rejection
        },
      });
      console.log(`[NitiPath EmailService] ✅ SMTP transporter initialized successfully via ${host}:${port}`);
      this.initialized = true;
      return this.transporter;
    } catch (err: any) {
      console.error('[NitiPath EmailService] ❌ Failed to create SMTP transporter:', err.message);
      return null;
    }
  }

  /**
   * Dispatches the genuine Supabase 6-digit OTP to the user's real email address.
   */
  public static async sendOtpEmail(options: SendOtpEmailOptions): Promise<{ sent: boolean; message: string }> {
    const { to, otp, type, magicLink, recipientName } = options;
    const from = process.env.SMTP_FROM || `"NitiPath Portal" <${process.env.SMTP_USER || 'noreply@nitipath.gov.in'}>`;

    const subject =
      type === 'officer'
        ? `NitiPath Official Clearance Portal: Your Verification Code is ${otp}`
        : `NitiPath (नीतिपथ) Enterprise Verification Code: ${otp}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Header -->
          <tr style="background-color: #0f172a; color: #ffffff;">
            <td style="padding: 24px 32px;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #f8fafc;">
                नीतिपथ <span style="color: #f59e0b;">| NitiPath</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; font-weight: 500;">
                National Industrial Approval & Statutory Compliance Intelligence Platform (SIH26130)
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                ${type === 'officer' ? 'शासकीय अधिकारी लॉगिन सत्यापन / Official Sign In OTP' : 'ईमेल सत्यापन कोड / Email Verification Code'}
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                ${recipientName ? `Namaste <strong>${recipientName}</strong>,<br>` : 'Hello,'}
                Please use the official single-use verification code below to complete your ${
                  type === 'officer' ? 'government clearance officer sign-in' : 'enterprise registration & business onboarding'
                } on the NitiPath portal:
              </p>

              <!-- OTP Code Display Card -->
              <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: #64748b; margin-bottom: 8px;">
                  Your Verification Code / ओटीपी
                </div>
                <div style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #1e3a8a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                  ${otp}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 500;">
                  ⏳ Code valid for <strong>15 minutes</strong> • Strictly single-use
                </div>
              </div>

              ${
                magicLink
                  ? `
              <div style="text-align: center; margin: 24px 0 16px 0;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Or confirm directly via one-click secure verification:</p>
                <a href="${magicLink}" style="display: inline-block; padding: 12px 28px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 8px; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);">
                  Confirm Email Address →
                </a>
              </div>
              `
                  : ''
              }

              <!-- Security Notice -->
              <div style="margin-top: 28px; padding: 14px 16px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px;">
                <div style="font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 4px;">
                  🔒 Security Notice / सुरक्षा दिशानिर्देश:
                </div>
                <div style="font-size: 11px; color: #b45309; line-height: 1.5;">
                  Never share your OTP with anyone. NitiPath administrators and government officials will never request your verification code. All access attempts are logged under the Information Technology Act.
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <td style="padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              This is an automated notification from the NitiPath Statutory Clearance & Compliance Platform.<br>
              © 2026 Government of India / State Industrial Licensing Authorities.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 1. Try sending via Resend API if RESEND_API_KEY is present
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'NitiPath <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
          }),
        });

        const resendData: any = await resendRes.json();
        if (resendRes.ok) {
          console.log(`[NitiPath EmailService] ✅ Real OTP email delivered to ${to} via Resend (ID: ${resendData.id})`);
          return { sent: true, message: `Real OTP email sent to ${to} via Resend` };
        } else {
          console.warn(`[NitiPath EmailService] Resend API error:`, resendData);
        }
      } catch (resendErr: any) {
        console.warn(`[NitiPath EmailService] Resend dispatch failed: ${resendErr.message}`);
      }
    }

    // 2. Try sending via configured SMTP transporter
    const transporter = this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from,
          to,
          subject,
          html,
          text: `Your NitiPath verification code is: ${otp}. It expires in 15 minutes.`,
        });
        console.log(`[NitiPath EmailService] ✅ Real OTP email delivered to ${to} via SMTP (MessageId: ${info.messageId})`);
        return { sent: true, message: `Real OTP email delivered to ${to}` };
      } catch (mailErr: any) {
        console.error(`[NitiPath EmailService] ❌ SMTP send failed for ${to}:`, mailErr.message);
        return { sent: false, message: `SMTP dispatch failed: ${mailErr.message}` };
      }
    }

    // 3. Fallback notice
    console.log(`[NitiPath EmailService] ℹ️ Generated OTP for ${to}: [${otp}]. (Configure SMTP_HOST or RESEND_API_KEY in backend/.env for live mailbox delivery)`);
    return {
      sent: false,
      message: 'SMTP credentials not configured in backend/.env; live delivery pending configuration.',
    };
  }
}
