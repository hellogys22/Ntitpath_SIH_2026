import http from 'http';
import { PrismaClient } from '@prisma/client';

const BACKEND_BASE = 'http://127.0.0.1:5001';
const FRONTEND_PROXY_BASE = 'http://localhost:3001';

const prisma = new PrismaClient();

interface TestResult {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function postJson(url: string, body: any): Promise<{ status: number; data: any }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch (e) {
    data = { raw: await res.text() };
  }
  return { status: res.status, data };
}

async function recordTest(
  id: string,
  category: string,
  name: string,
  fn: () => Promise<string | void>
) {
  const start = Date.now();
  try {
    const details = (await fn()) || 'Passed successfully';
    results.push({
      id,
      category,
      name,
      passed: true,
      durationMs: Date.now() - start,
      details,
    });
  } catch (err: any) {
    results.push({
      id,
      category,
      name,
      passed: false,
      durationMs: Date.now() - start,
      error: err.message || String(err),
    });
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
}

export async function runOtpTestSuite() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       NITIPATH (नीतिपथ) END-TO-END OTP SYSTEM TEST AGENT & AUDIT SUITE       ║');
  console.log('║             Supabase Auth built-in OTP + Officer Portal Hardening            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const testEmailSeed = Date.now();
  const newBusinessEmail = `enterprise.${testEmailSeed}@cg-industries.in`;
  let businessDevOtp = '';
  let officerDevOtp = '';
  let loginDevOtp = '';

  // --------------------------------------------------------------------------
  // GROUP 1: BUSINESS OWNER REGISTRATION OTP FLOW
  // --------------------------------------------------------------------------
  await recordTest(
    'REG-01',
    'Business Registration',
    'Request 6-digit OTP for new business registration',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/send`, {
        email: newBusinessEmail,
        type: 'business',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.success === true, 'Response success flag must be true');
      assert(!!res.data.data?.devOtp, 'Server must return generated OTP token');
      businessDevOtp = res.data.data.devOtp;
      return `OTP dispatched for ${newBusinessEmail} (Code: ${businessDevOtp}, Length: ${res.data.data.codeLength})`;
    }
  );

  await recordTest(
    'REG-02',
    'Business Registration',
    'Reject invalid / wrong OTP on business verification',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/verify`, {
        email: newBusinessEmail,
        otp: '00000000',
        type: 'business',
      });
      assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
      assert(res.data.success === false, 'Expected success: false for wrong code');
      assert(res.data.isExpired === true, 'Expected isExpired: true flag');
      return `Wrong code properly rejected with message: "${res.data.message}"`;
    }
  );

  await recordTest(
    'REG-03',
    'Business Registration',
    'Verify genuine OTP and provision enterprise profile',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/verify`, {
        email: newBusinessEmail,
        otp: businessDevOtp,
        type: 'business',
        companyName: 'Raipur Agri Foods & Cold Storage Pvt. Ltd.',
        mobile: '+91 98261 77889',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.success === true, 'Verification success must be true');
      assert(res.data.data?.user?.email === newBusinessEmail, 'User email must match');
      assert(res.data.data?.role === 'business', 'Role must be business');
      assert(!!res.data.data?.user?.emailConfirmedAt, 'emailConfirmedAt must be valid timestamp');
      assert(res.data.data?.business?.name === 'Raipur Agri Foods & Cold Storage Pvt. Ltd.', 'Company name match');
      assert(!!res.data.data?.token, 'JWT session token must be issued');
      return `User and business successfully provisioned with confirmed email at ${res.data.data.user.emailConfirmedAt}`;
    }
  );

  await recordTest(
    'REG-04',
    'Business Registration',
    'Database integrity check for registered business & user',
    async () => {
      const dbUser = await prisma.user.findUnique({
        where: { email: newBusinessEmail },
        include: { businesses: true },
      });
      assert(!!dbUser, 'User record must exist in SQLite database');
      assert(dbUser!.role === 'BUSINESS_USER', 'Role must be BUSINESS_USER');
      assert(dbUser!.businesses.length > 0, 'Associated business record must exist');
      assert(dbUser!.businesses[0].name === 'Raipur Agri Foods & Cold Storage Pvt. Ltd.', 'Business name matches');
      return `Prisma verified User ID: ${dbUser!.id}, Business ID: ${dbUser!.businesses[0].id}`;
    }
  );

  await recordTest(
    'REG-05',
    'Business Registration',
    'Verify BUSINESS_REGISTRATION_VERIFIED audit log entry',
    async () => {
      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'BUSINESS_REGISTRATION_VERIFIED',
          details: { contains: newBusinessEmail },
        },
      });
      assert(!!audit, 'AuditLog entry must exist for registration verification');
      return `Audit log recorded with ID: ${audit!.id} at ${audit!.createdAt.toISOString()}`;
    }
  );

  // --------------------------------------------------------------------------
  // GROUP 2: BUSINESS OWNER LOGIN OTP FLOW
  // --------------------------------------------------------------------------
  await recordTest(
    'LOG-01',
    'Business Login',
    'Request OTP for existing enterprise user (business@demo.com)',
    async () => {
      // Clear rate limit for demo account so test suite run is idempotent
      await postJson(`${BACKEND_BASE}/api/auth/otp/reset-rate-limit`, {
        email: 'business@demo.com',
      });
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/send`, {
        email: 'business@demo.com',
        type: 'business',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(!!res.data.data?.devOtp, 'devOtp must be returned');
      loginDevOtp = res.data.data.devOtp;
      return `Login OTP dispatched for business@demo.com: ${loginDevOtp}`;
    }
  );

  await recordTest(
    'LOG-02',
    'Business Login',
    'Verify OTP for existing business user and return existing enterprise data',
    async () => {
      const verifyRes = await postJson(`${BACKEND_BASE}/api/auth/otp/verify`, {
        email: 'business@demo.com',
        otp: loginDevOtp,
        type: 'business',
      });
      assert(verifyRes.status === 200, `Expected 200, got ${verifyRes.status}`);
      assert(verifyRes.data.data.user.name === 'Rajesh Sharma', 'Existing name should load');
      assert(verifyRes.data.data.business?.name === 'Raipur Fresh Foods Pvt. Ltd.', 'Pre-existing business should load');
      return `Logged in existing enterprise: ${verifyRes.data.data.user.name} (${verifyRes.data.data.business.name})`;
    }
  );

  // --------------------------------------------------------------------------
  // GROUP 3: GOVERNMENT / OFFICER LOGIN & ANTI-ENUMERATION
  // --------------------------------------------------------------------------
  await recordTest(
    'OFF-01',
    'Officer Portal',
    'Anti-enumeration: Reject unlisted officer email with generic stealth notice',
    async () => {
      const unauthEmail = 'intruder.eval@external.gov.phishing.org';
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/send`, {
        email: unauthEmail,
        type: 'officer',
      });
      assert(res.status === 200, 'Must return 200 to prevent status enumeration');
      assert(res.data.data.stealth === true, 'stealth flag must be set internally');
      assert(
        res.data.message === 'If this email is registered as an authorized official, a verification code has been sent.',
        'Must display exact anti-enumeration messaging'
      );
      assert(!res.data.data.devOtp, 'No OTP code should ever be generated for unauthorized emails');
      return 'Generic response returned, stealth mode active, no OTP dispatched';
    }
  );

  await recordTest(
    'OFF-02',
    'Officer Portal',
    'Verify OFFICER_OTP_REJECTED_UNAUTHORIZED recorded in audit logs',
    async () => {
      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'OFFICER_OTP_REJECTED_UNAUTHORIZED',
          details: { contains: 'intruder.eval@external.gov.phishing.org' },
        },
      });
      assert(!!audit, 'Audit log entry must be recorded for unauthorized access attempt');
      return `Security breach attempt tracked in AuditLog ID: ${audit!.id}`;
    }
  );

  await recordTest(
    'OFF-03',
    'Officer Portal',
    'Send OTP to authorized clearance officer (epcb.officer@cg.gov.in)',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/send`, {
        email: 'epcb.officer@cg.gov.in',
        type: 'officer',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(!!res.data.data?.devOtp, 'devOtp must be returned for authorized officer');
      officerDevOtp = res.data.data.devOtp;
      return `Officer OTP generated for Shri Rajesh Kumar Kujur (Code: ${officerDevOtp})`;
    }
  );

  await recordTest(
    'OFF-04',
    'Officer Portal',
    'Verify OFFICER_OTP_REQUESTED recorded in audit logs',
    async () => {
      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'OFFICER_OTP_REQUESTED',
          details: { contains: 'Shri Rajesh Kumar Kujur' },
        },
      });
      assert(!!audit, 'Audit log entry must exist for authorized officer OTP request');
      return `Audit log confirmed: "${audit!.details}"`;
    }
  );

  await recordTest(
    'OFF-05',
    'Officer Portal',
    'Reject invalid OTP on officer verification and record OFFICER_LOGIN_FAILED',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/verify`, {
        email: 'epcb.officer@cg.gov.in',
        otp: '11111111',
        type: 'officer',
      });
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      assert(res.data.success === false, 'Expected success: false');

      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'OFFICER_LOGIN_FAILED',
          details: { contains: 'epcb.officer@cg.gov.in' },
        },
      });
      assert(!!audit, 'OFFICER_LOGIN_FAILED must be written to audit ledger');
      return `Failure rejected & logged in audit ledger: "${audit!.details}"`;
    }
  );

  await recordTest(
    'OFF-06',
    'Officer Portal',
    'Verify valid officer OTP and enforce admin role & department credentials',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/otp/verify`, {
        email: 'epcb.officer@cg.gov.in',
        otp: officerDevOtp,
        type: 'officer',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.data.role === 'admin', 'Officer role must be admin');
      assert(res.data.data.user.name === 'Shri Rajesh Kumar Kujur', 'Name must match official roster');
      assert(res.data.data.user.department === 'Environment & Pollution Control Board', 'Dept matches');
      assert(res.data.data.user.badgeNumber === 'CECB-EE-1102', 'Badge number matches');

      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'OFFICER_LOGIN_SUCCESS',
          details: { contains: 'CECB-EE-1102' },
        },
      });
      assert(!!audit, 'OFFICER_LOGIN_SUCCESS must be written to audit ledger');
      return `Officer verified: ${res.data.data.user.name} (${res.data.data.user.designation}, Badge: ${res.data.data.user.badgeNumber})`;
    }
  );

  // --------------------------------------------------------------------------
  // GROUP 4: RATE LIMITING HARDENING (5 SENDS / HOUR / EMAIL)
  // --------------------------------------------------------------------------
  await recordTest(
    'RATE-01',
    'Rate Limiting',
    'Enforce 5 requests/hour max per email and verify HTTP 429 on 6th request',
    async () => {
      const rateLimitTestEmail = `spamtest.${Date.now()}@test.in`;
      for (let i = 1; i <= 5; i++) {
        const sendRes = await postJson(`${BACKEND_BASE}/api/auth/otp/send`, {
          email: rateLimitTestEmail,
          type: 'business',
        });
        assert(sendRes.status === 200, `Attempt ${i} should be permitted`);
      }

      // 6th attempt must return 429
      const blockedRes = await postJson(`${BACKEND_BASE}/api/auth/otp/send`, {
        email: rateLimitTestEmail,
        type: 'business',
      });
      assert(blockedRes.status === 429, `6th attempt must be blocked with 429, got ${blockedRes.status}`);
      assert(
        blockedRes.data.message.includes('Rate limit exceeded'),
        'Message must state rate limit exceeded'
      );
      assert(typeof blockedRes.data.retryAfter === 'number', 'retryAfter numeric value must be provided');
      return `Attempts 1-5 permitted (200 OK); 6th attempt blocked with HTTP 429 (Retry After: ${blockedRes.data.retryAfter}s)`;
    }
  );

  // --------------------------------------------------------------------------
  // GROUP 5: SINGLE-USE & EXPIRATION HARDENING
  // --------------------------------------------------------------------------
  await recordTest(
    'EXPR-01',
    'Single-Use Token',
    'Enforce single-use OTP: Replaying already verified token must be rejected',
    async () => {
      // Re-verifying the already used businessDevOtp
      const replayRes = await postJson(`${BACKEND_BASE}/api/auth/otp/verify`, {
        email: newBusinessEmail,
        otp: businessDevOtp,
        type: 'business',
      });
      assert(replayRes.status === 400, `Replay must return 400, got ${replayRes.status}`);
      assert(replayRes.data.isExpired === true, 'Replayed token must be flagged as expired/invalid');
      return `Replay rejected: "${replayRes.data.message}"`;
    }
  );

  // --------------------------------------------------------------------------
  // GROUP 6: PUBLIC REGISTRATION LOCKDOWN
  // --------------------------------------------------------------------------
  await recordTest(
    'SEC-01',
    'Security Hardening',
    'Strictly block creation of DEPARTMENT_OFFICER or ADMIN via public /register',
    async () => {
      const attackRes = await postJson(`${BACKEND_BASE}/api/auth/register`, {
        email: `fake.admin.${Date.now()}@attack.in`,
        password: 'Password123!',
        name: 'Hacker Administrator',
        role: 'DEPARTMENT_OFFICER',
      });
      assert(
        attackRes.status >= 400,
        `Public officer registration attempt must fail, got ${attackRes.status}`
      );
      return `Public attempt to elevate privileges blocked with status ${attackRes.status}`;
    }
  );

  // --------------------------------------------------------------------------
  // GROUP 7: FRONTEND PROXY INTEGRATION (/api/...)
  // --------------------------------------------------------------------------
  await recordTest(
    'PRX-01',
    'Frontend Proxy',
    'Verify /api/auth/otp/send and verify work cleanly through Vite proxy (port 3001)',
    async () => {
      const proxyEmail = `proxy.user.${Date.now()}@cg.gov.in`;
      const sendRes = await postJson(`${FRONTEND_PROXY_BASE}/api/auth/otp/send`, {
        email: proxyEmail,
        type: 'business',
      });
      assert(sendRes.status === 200, `Vite proxy must return 200 OK, got ${sendRes.status}`);
      assert(!!sendRes.data.data?.devOtp, 'Vite proxy must receive devOtp');

      const otp = sendRes.data.data.devOtp;
      const verifyRes = await postJson(`${FRONTEND_PROXY_BASE}/api/auth/otp/verify`, {
        email: proxyEmail,
        otp,
        type: 'business',
        companyName: 'Vite Proxy Verified Solar Unit',
      });
      assert(verifyRes.status === 200, `Verify through proxy must return 200, got ${verifyRes.status}`);
      return `Both send and verify succeeded seamlessly through Vite proxy on port 3001`;
    }
  );

  // --------------------------------------------------------------------------
  // SUMMARY REPORT GENERATION
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('                            DETAILED TEST RESULTS                               ');
  console.log('================================================================================');

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  results.forEach((r, idx) => {
    const statusSymbol = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${idx + 1}/${results.length}] ${statusSymbol} [${r.id}] ${r.category} -> ${r.name} (${r.durationMs}ms)`);
    if (r.details) {
      console.log(`       ℹ️  ${r.details}`);
    }
    if (r.error) {
      console.log(`       🚨 Error: ${r.error}`);
    }
  });

  console.log('\n================================================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log(`OVERALL HEALTH: ${failedCount === 0 ? '100% OPERATIONAL & HARDENED' : 'FAILURES DETECTED'}`);
  console.log('================================================================================\n');

  await prisma.$disconnect();

  if (failedCount > 0) {
    process.exit(1);
  }
}

runOtpTestSuite().catch(async (e) => {
  console.error('Fatal Test Runner Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
