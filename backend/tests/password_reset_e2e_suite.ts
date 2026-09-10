import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, supabaseAnon } from '../src/config/supabase';

const BACKEND_BASE = 'http://127.0.0.1:5001';
const FRONTEND_PROXY_BASE = 'http://localhost:3000';

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

async function runTestSuite() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║    NITIPATH (नीतिपथ) FORGOT PASSWORD & RESET PASSWORD E2E AUDIT SUITE       ║');
  console.log('║       Supabase Auth Built-in Recovery + API Rate-Limiting Verification        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // Reset any previous rate limits
  await postJson(`${BACKEND_BASE}/api/auth/password/reset-rate-limit`, {});

  // ==========================================
  // CATEGORY 1: FORGOT PASSWORD REQUEST & ANTI-ENUMERATION
  // ==========================================

  let devResetLink: string | undefined;

  await recordTest(
    'FGT-01',
    'Forgot Password Request',
    'Request password reset link for registered enterprise user',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/forgot-password`, {
        email: 'business@demo.com',
        redirectTo: 'http://localhost:3000/reset-password',
      });

      if (res.status !== 200 || !res.data?.success) {
        throw new Error(`Expected 200 OK, received ${res.status}: ${JSON.stringify(res.data)}`);
      }

      if (
        !res.data.message.includes('If an account exists for this email, a password reset link has been sent.')
      ) {
        throw new Error(`Anti-enumeration message missing: ${res.data.message}`);
      }

      devResetLink = res.data?.data?.devResetLink;
      return `Reset request accepted with generic confirmation: "${res.data.message}"${devResetLink ? ` (Recovery link: ${devResetLink.slice(0, 45)}...)` : ''}`;
    }
  );

  await recordTest(
    'FGT-02',
    'Anti-Enumeration Protection',
    'Request password reset for non-existent email must return identical generic message',
    async () => {
      const fakeEmail = `nonexistent.enterprise.${Date.now()}@domain-never-registered.in`;
      const res = await postJson(`${BACKEND_BASE}/api/auth/forgot-password`, {
        email: fakeEmail,
        redirectTo: 'http://localhost:3000/reset-password',
      });

      if (res.status !== 200 || !res.data?.success) {
        throw new Error(`Expected 200 OK, got ${res.status}: ${JSON.stringify(res.data)}`);
      }

      if (
        res.data.message !== 'If an account exists for this email, a password reset link has been sent.'
      ) {
        throw new Error(`Leaked user existence state! Received: "${res.data.message}"`);
      }

      return `No user existence leaked for ${fakeEmail}. Exact anti-enumeration message verified.`;
    }
  );

  await recordTest(
    'FGT-03',
    'Validation Protection',
    'Reject malformed email addresses with HTTP 400',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/forgot-password`, {
        email: 'invalid-email-missing-at',
      });

      if (res.status !== 400 || res.data?.success) {
        throw new Error(`Expected 400 Bad Request, received ${res.status}`);
      }

      return `Malformed email rejected with HTTP 400: "${res.data.message}"`;
    }
  );

  // ==========================================
  // CATEGORY 2: API ROUTE-LEVEL RATE LIMITING
  // ==========================================

  await recordTest(
    'RATE-01',
    'Rate Limiting Protection',
    'Enforce max 5 password reset requests per hour per email (HTTP 429 on 6th)',
    async () => {
      const testEmail = `ratelimit.enterprise.${Date.now()}@cg-portal.in`;

      // 5 allowed requests
      for (let i = 1; i <= 5; i++) {
        const res = await postJson(`${BACKEND_BASE}/api/auth/forgot-password`, {
          email: testEmail,
          redirectTo: 'http://localhost:3000/reset-password',
        });
        if (res.status !== 200) {
          throw new Error(`Attempt ${i}/5 unexpectedly blocked with status ${res.status}`);
        }
      }

      // 6th request must trigger HTTP 429
      const blockedRes = await postJson(`${BACKEND_BASE}/api/auth/forgot-password`, {
        email: testEmail,
        redirectTo: 'http://localhost:3000/reset-password',
      });

      if (blockedRes.status !== 429) {
        throw new Error(`Expected HTTP 429 Too Many Requests, received ${blockedRes.status}`);
      }

      if (!blockedRes.data?.message?.includes('Rate limit exceeded')) {
        throw new Error(`Expected rate limit message, received: ${blockedRes.data?.message}`);
      }

      return `Attempts 1-5 permitted (200 OK); 6th attempt blocked with HTTP 429 (Retry-After: ${blockedRes.data.retryAfter}s)`;
    }
  );

  // ==========================================
  // CATEGORY 3: RECOVERY LINK & TOKEN VALIDATION
  // ==========================================

  await recordTest(
    'RCV-01',
    'Recovery Token Generation',
    'Generate authentic Supabase recovery link and verify recovery token structure',
    async () => {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
      }

      const testUserEmail = 'business@demo.com';
      const linkRes = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: testUserEmail,
        options: {
          redirectTo: 'http://localhost:3000/reset-password',
        },
      });

      if (!linkRes.data?.properties?.action_link) {
        throw new Error('Supabase admin failed to generate action_link');
      }

      const actionLink = linkRes.data.properties.action_link;
      if (!actionLink.includes('/reset-password') && !actionLink.includes('token=')) {
        throw new Error(`Generated link does not route to reset-password: ${actionLink}`);
      }

      return `Authentic Supabase recovery link generated: ${actionLink.slice(0, 60)}...`;
    }
  );

  await recordTest(
    'RCV-02',
    'Invalid Token Guard',
    'Reject malformed or tampered token with clear error',
    async () => {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
      }

      const { data, error } = await supabaseAdmin.auth.getUser('tampered_fake_access_token_xyz999');
      if (!error && data.user) {
        throw new Error('Fake access token was unexpectedly accepted!');
      }

      return `Tampered recovery token properly rejected: "${error?.message || 'Invalid token'}"`;
    }
  );

  // ==========================================
  // CATEGORY 4: COMPLETE RESET PASSWORD & DUAL CREDENTIAL VERIFICATION
  // ==========================================

  const testEmail = `reset.loop.${Date.now()}@cg-industries.in`;
  const initialPassword = 'OldInitialPassword@123';
  const updatedPassword = 'NewSecretPassword@456';

  await recordTest(
    'LOOP-01',
    'End-to-End Loop Setup',
    'Seed active user in database and verify initial credentials work',
    async () => {
      const hashedPassword = await bcrypt.hash(initialPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          name: 'Reset Loop Enterprise',
          role: 'BUSINESS_USER',
        },
      });

      // Confirm login with old password works
      const loginRes = await postJson(`${BACKEND_BASE}/api/auth/login`, {
        email: testEmail,
        password: initialPassword,
      });

      if (loginRes.status !== 200 || !loginRes.data?.data?.token) {
        throw new Error(`Initial login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
      }

      return `Created test user ${user.email} (ID: ${user.id}). Verified initial password authenticates cleanly.`;
    }
  );

  await recordTest(
    'LOOP-02',
    'Password Update Validation',
    'Reject password updates shorter than 6 characters',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/password/reset`, {
        email: testEmail,
        newPassword: '123',
      });

      if (res.status !== 400 || res.data?.success) {
        throw new Error(`Expected 400 Bad Request, got ${res.status}`);
      }

      return `Short password rejected: "${res.data?.message}"`;
    }
  );

  await recordTest(
    'LOOP-03',
    'Complete Password Reset',
    'Complete password update and verify success response and AuditLog',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/password/reset`, {
        email: testEmail,
        newPassword: updatedPassword,
      });

      if (res.status !== 200 || !res.data?.success) {
        throw new Error(`Expected 200 OK, received ${res.status}: ${JSON.stringify(res.data)}`);
      }

      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'PASSWORD_RESET_COMPLETED',
          details: { contains: testEmail },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!audit) {
        throw new Error('PASSWORD_RESET_COMPLETED audit log entry missing');
      }

      return `Password updated successfully. Audit log recorded (ID: ${audit.id})`;
    }
  );

  await recordTest(
    'LOOP-04',
    'Old Password Invalidation',
    'Confirm old password is now rejected (401/500)',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/login`, {
        email: testEmail,
        password: initialPassword,
      });

      if (res.status === 200) {
        throw new Error('SECURITY VIOLATION: Old password still accepted after reset!');
      }

      return `Old password successfully invalidated: "${res.data?.message || 'Invalid email or password'}"`;
    }
  );

  await recordTest(
    'LOOP-05',
    'New Password Verification',
    'Confirm login succeeds with new password',
    async () => {
      const res = await postJson(`${BACKEND_BASE}/api/auth/login`, {
        email: testEmail,
        password: updatedPassword,
      });

      if (res.status !== 200 || !res.data?.data?.token) {
        throw new Error(`Login with new password failed with status ${res.status}: ${JSON.stringify(res.data)}`);
      }

      return `Login succeeded with new password! Authenticated user: ${res.data.data.user.name} (${res.data.data.user.email})`;
    }
  );

  // ==========================================
  // CATEGORY 5: FRONTEND PROXY INTEGRATION
  // ==========================================

  await recordTest(
    'PRX-01',
    'Frontend Proxy Integration',
    'Verify /api/auth/forgot-password route operates through Vite dev proxy',
    async () => {
      const res = await postJson(`${FRONTEND_PROXY_BASE}/api/auth/forgot-password`, {
        email: 'business@demo.com',
        redirectTo: 'http://localhost:3000/reset-password',
      });

      if (res.status !== 200 || !res.data?.success) {
        throw new Error(`Proxy call returned status ${res.status}: ${JSON.stringify(res.data)}`);
      }

      return 'Vite dev proxy (port 3000) cleanly routed forgot-password request to port 5001';
    }
  );

  // ==========================================
  // SUMMARY REPORT
  // ==========================================

  console.log('\n================================================================================');
  console.log('                            DETAILED TEST RESULTS                               ');
  console.log('================================================================================');

  let passedCount = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const indexStr = `[${i + 1}/${results.length}]`;
    if (r.passed) {
      passedCount++;
      console.log(`${indexStr} ✅ PASS [${r.id}] ${r.category} -> ${r.name} (${r.durationMs}ms)`);
      if (r.details) {
        console.log(`       ℹ️  ${r.details}`);
      }
    } else {
      console.log(`${indexStr} ❌ FAIL [${r.id}] ${r.category} -> ${r.name} (${r.durationMs}ms)`);
      console.log(`       🚨 Error: ${r.error}`);
    }
  }

  console.log('\n================================================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log(`OVERALL STATUS: ${passedCount === results.length ? '100% OPERATIONAL & VERIFIED' : 'FAILURES DETECTED'}`);
  console.log('================================================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runTestSuite()
  .catch(err => {
    console.error('Fatal test suite error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
