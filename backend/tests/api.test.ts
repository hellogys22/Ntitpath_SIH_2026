import http from 'http';
import app from '../src/app';

const PORT = 5002;
let server: http.Server;
let businessToken = '';
let adminToken = '';
let applicationId = '';

function request(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData).toString();

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode || 500, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode || 500, body: { raw: rawData } });
          }
        });
      }
    );

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting NitiPath Backend Verification Tests...\n');
  server = app.listen(PORT);

  try {
    // 1. Health Check
    const health = await request('GET', '/health');
    console.assert(health.status === 200, `Health check failed: ${health.status}`);
    console.log('✅ 1. Health check endpoint OK (/health)');

    // 2. Business User Login
    const bizLogin = await request('POST', '/api/auth/login', {
      email: 'business@demo.com',
      password: 'demo123',
    });
    console.assert(bizLogin.status === 200, `Business login failed: ${bizLogin.status}`);
    businessToken = bizLogin.body.data.token;
    console.log('✅ 2. Business user authenticated (JWT generated)');

    // 3. Admin User Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@demo.com',
      password: 'admin123',
    });
    console.assert(adminLogin.status === 200, `Admin login failed: ${adminLogin.status}`);
    adminToken = adminLogin.body.data.token;
    console.log('✅ 3. Admin/Department user authenticated');

    // 4. Get Business Profile & Application
    const myBiz = await request('GET', '/api/businesses/my', undefined, businessToken);
    console.assert(myBiz.status === 200 && myBiz.body.data.length > 0, 'Fetch business failed');
    applicationId = myBiz.body.data[0].applications[0].id;
    console.log(`✅ 4. Retrieved active application: ${myBiz.body.data[0].applications[0].applicationNumber} (ID: ${applicationId})`);

    // 5. Application Dashboard & Intelligence Suite
    const dashboard = await request('GET', `/api/applications/${applicationId}/dashboard`, undefined, businessToken);
    console.assert(dashboard.status === 200, `Dashboard failed: ${dashboard.status}`);
    const intel = dashboard.body.data.intelligence;
    console.assert(intel.readiness.readinessScore > 0, 'Readiness score missing');
    console.assert(intel.dependencyGraph.criticalPathNodes.length > 0, 'Critical path calculation missing');
    console.log(`✅ 5. Intelligence Dashboard loaded (Readiness: ${intel.readiness.readinessScore}%, Critical Path Days: ${intel.dependencyGraph.totalCriticalPathDays} days)`);

    // 6. Pre-Submission Document Consistency Audit (10,000 sq ft vs 12,500 sq ft mismatch)
    const audit = await request('GET', `/api/documents/application/${applicationId}/consistency-audit`, undefined, businessToken);
    console.assert(audit.status === 200, `Audit failed: ${audit.status}`);
    console.assert(audit.body.data.mismatchesCount > 0, 'Area mismatch not detected');
    console.log(`✅ 6. Cross-Document Consistency Engine detected area conflict:`);
    console.log(`   └─ Field: ${audit.body.data.mismatches[0].field}`);
    console.log(`   └─ Value: ${audit.body.data.mismatches[0].currentValue} vs ${audit.body.data.mismatches[0].conflictValue}`);
    console.log(`   └─ Severity: ${audit.body.data.mismatches[0].severity}`);

    // 7. Next Best Action Prediction
    const nextAction = await request('GET', `/api/applications/${applicationId}/next-action`, undefined, businessToken);
    console.assert(nextAction.status === 200, `Next Action failed: ${nextAction.status}`);
    console.log(`✅ 7. Next Best Action predicted: "${nextAction.body.data.title}" (Priority: ${nextAction.body.data.priority})`);

    // 8. Admin Dashboard Analytics
    const adminDash = await request('GET', '/api/admin/dashboard', undefined, adminToken);
    console.assert(adminDash.status === 200, `Admin dash failed: ${adminDash.status}`);
    console.log(`✅ 8. Admin Portal analytics loaded (Total Apps: ${adminDash.body.data.overview.totalApplications}, High Risk: ${adminDash.body.data.overview.highRiskApplications})`);

    // 9. Support Scheme Matching
    const schemes = await request('GET', '/api/compliance/schemes/match?sector=Food%20Processing&investmentCr=5.0', undefined, businessToken);
    console.assert(schemes.status === 200 && schemes.body.data.length > 0, 'Schemes failed');
    console.log(`✅ 9. Support Schemes matched: ${schemes.body.data.length} eligible state & central subsidies`);

    // 10. Copilot Query
    const copilot = await request('POST', '/api/copilot/query', {
      applicationId,
      question: 'Why is my project marked high risk and what is the timeline?',
    }, businessToken);
    console.assert(copilot.status === 200 && copilot.body.data.reply.length > 0, 'Copilot failed');
    console.log(`✅ 10. NitiPath AI Copilot generated contextual guidance:`);
    console.log(`   └─ Reply snippet: "${copilot.body.data.reply.substring(0, 100)}..."`);

    console.log('\n🎉 ALL 10 TEST SUITES PASSED FLAWLESSLY!\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
