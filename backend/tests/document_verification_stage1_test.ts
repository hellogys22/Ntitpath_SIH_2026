import { VerificationService } from '../src/services/verification.service';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function recordTest(id: string, name: string, fn: () => Promise<string | void>) {
  const start = Date.now();
  try {
    const details = (await fn()) || 'Passed';
    results.push({ id, name, passed: true, durationMs: Date.now() - start, details });
  } catch (err: any) {
    results.push({ id, name, passed: false, durationMs: Date.now() - start, error: err.message || String(err) });
  }
}

async function runStage1Tests() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       NITIPATH STAGE 1: DOCUMENT CENTER & DETERMINISTIC RULE ENGINE          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const registeredCompany = 'Raipur Fresh Foods Pvt. Ltd.';

  // TEST 1: Missing Required Fields Check
  await recordTest('V-01', 'Deterministic Check 1: Missing Required Fields', async () => {
    const res = VerificationService.verify({
      docName: 'Certificate of Incorporation & GSTIN',
      docType: 'CIN',
      companyName: registeredCompany,
      metadata: { hasMissingFields: true },
    });

    const fieldCheck = res.ruleChecks.find(c => c.category === 'REQUIRED_FIELDS');
    if (!fieldCheck || fieldCheck.passed) {
      throw new Error('Expected REQUIRED_FIELDS check to fail for missing registration number');
    }
    if (!fieldCheck.message.includes('missing mandatory statutory fields')) {
      throw new Error(`Unexpected message: ${fieldCheck.message}`);
    }

    return `Failed as expected with specific reason: "${fieldCheck.message}"`;
  });

  // TEST 2: Company Entity Name Typo / Mismatch Check
  await recordTest('V-02', 'Deterministic Check 2: Company Name Discrepancy (User Prompt Spec)', async () => {
    const docCompany = 'Raipur Fresh Food Pvt Ltd'; // Missing trailing 's' and period
    const res = VerificationService.verify({
      docName: 'Land Allotment Order & Lease Deed',
      docType: 'LAND_LEASE',
      companyName: registeredCompany,
      metadata: { companyName: docCompany },
    });

    const entityCheck = res.ruleChecks.find(c => c.category === 'ENTITY_MATCH');
    if (!entityCheck || entityCheck.passed) {
      throw new Error('Expected ENTITY_MATCH check to fail for company name typo');
    }

    if (!entityCheck.message.includes(`Company name on this document reads '${docCompany}'`)) {
      throw new Error(`Expected prompt-specified message, received: ${entityCheck.message}`);
    }

    if (!entityCheck.remediation.includes('Re-upload a corrected document')) {
      throw new Error(`Expected plain-language remediation instructions, received: ${entityCheck.remediation}`);
    }

    return `Correctly flagged entity mismatch: "${entityCheck.message}"`;
  });

  // TEST 3: Company Entity Name Matches
  await recordTest('V-03', 'Deterministic Check 2: Company Name Exact Match Passes', async () => {
    const res = VerificationService.verify({
      docName: 'Land Allotment Order & Lease Deed',
      docType: 'LAND_LEASE',
      companyName: registeredCompany,
      metadata: { companyName: registeredCompany },
    });

    const entityCheck = res.ruleChecks.find(c => c.category === 'ENTITY_MATCH');
    if (!entityCheck || !entityCheck.passed) {
      throw new Error('Expected ENTITY_MATCH to pass when company name matches');
    }

    return `Entity match verified: "${entityCheck.message}"`;
  });

  // TEST 4: Certificate Expiration Check
  await recordTest('V-04', 'Deterministic Check 3: Expired Document Rejection', async () => {
    const expiredDate = '2026-08-15';
    const res = VerificationService.verify({
      docName: 'Provisional Water Allocation NOC',
      docType: 'WATER_NOC',
      companyName: registeredCompany,
      metadata: { validUntil: expiredDate },
    });

    const expiryCheck = res.ruleChecks.find(c => c.category === 'VALIDITY_DATE');
    if (!expiryCheck || expiryCheck.passed) {
      throw new Error('Expected VALIDITY_DATE check to fail for expired certificate');
    }

    if (!expiryCheck.message.includes('expired')) {
      throw new Error(`Expected expiry message, received: ${expiryCheck.message}`);
    }

    return `Expired document detected: "${expiryCheck.message}"`;
  });

  // TEST 5: Unexpired Certificate Passes
  await recordTest('V-05', 'Deterministic Check 3: Current Unexpired Certificate Passes', async () => {
    const futureDate = '2028-12-31';
    const res = VerificationService.verify({
      docName: 'Factory Building Plan Sanction',
      docType: 'BUILDING_PLAN',
      companyName: registeredCompany,
      metadata: { validUntil: futureDate },
    });

    const expiryCheck = res.ruleChecks.find(c => c.category === 'VALIDITY_DATE');
    if (!expiryCheck || !expiryCheck.passed) {
      throw new Error('Expected VALIDITY_DATE to pass for future date');
    }

    return `Unexpired certificate verified: "${expiryCheck.message}"`;
  });

  // TEST 6: Cross-Document Area Discrepancy (10,000 sq ft vs 12,500 sq ft)
  await recordTest('V-06', 'Deterministic Check 4: Cross-Document Area Discrepancy', async () => {
    const res = VerificationService.verify({
      docName: 'Approved Building Site Plan & Layout',
      docType: 'SITE_PLAN',
      companyName: registeredCompany,
      metadata: { builtUpAreaSqFt: 10000 },
    });

    const consistencyCheck = res.ruleChecks.find(c => c.category === 'CROSS_DOCUMENT_CONSISTENCY');
    if (!consistencyCheck || consistencyCheck.passed) {
      throw new Error('Expected CROSS_DOCUMENT_CONSISTENCY check to fail for 10,000 vs 12,500 sq ft mismatch');
    }

    if (!consistencyCheck.message.includes('10,000 sq ft') || !consistencyCheck.message.includes('12,500 sq ft')) {
      throw new Error(`Missing dimensional values in message: ${consistencyCheck.message}`);
    }

    return `Dimensional contradiction detected: "${consistencyCheck.message}"`;
  });

  // TEST 7: Cross-Document Area Synchronized (12,500 sq ft)
  await recordTest('V-07', 'Deterministic Check 4: Synchronized Dimensions Pass', async () => {
    const res = VerificationService.verify({
      docName: 'Approved Building Site Plan & Layout',
      docType: 'SITE_PLAN',
      companyName: registeredCompany,
      metadata: { builtUpAreaSqFt: 12500 },
    });

    const consistencyCheck = res.ruleChecks.find(c => c.category === 'CROSS_DOCUMENT_CONSISTENCY');
    if (!consistencyCheck || !consistencyCheck.passed) {
      throw new Error('Expected CROSS_DOCUMENT_CONSISTENCY check to pass for aligned dimensions');
    }

    return `Dimensions aligned: "${consistencyCheck.message}"`;
  });

  // TEST 8: Full Clean Document -> Status VERIFIED
  await recordTest('V-08', 'Overall Verdict: Verified Status when All Rule Checks Pass', async () => {
    const res = VerificationService.verify({
      docName: 'Certificate of Incorporation & GSTIN Registration',
      docType: 'CIN',
      companyName: registeredCompany,
      metadata: {
        registrationNumber: 'U15400CT2026PTC012345',
        companyName: registeredCompany,
        validUntil: '2050-01-01',
      },
    });

    if (res.status !== 'VERIFIED') {
      throw new Error(`Expected status VERIFIED, got ${res.status}`);
    }

    return `All 4 checks passed cleanly -> Status: ${res.status}`;
  });

  // TEST 9: Flawed Document -> Status NEEDS_CORRECTION
  await recordTest('V-09', 'Overall Verdict: Needs Correction Status with Inline Action', async () => {
    const res = VerificationService.verify({
      docName: 'Approved Building Site Plan & Layout',
      docType: 'SITE_PLAN',
      companyName: registeredCompany,
      metadata: {
        builtUpAreaSqFt: 10000,
        companyName: 'Raipur Fresh Food Pvt Ltd', // Typo
      },
    });

    if (res.status !== 'NEEDS_CORRECTION') {
      throw new Error(`Expected status NEEDS_CORRECTION, got ${res.status}`);
    }

    const failed = res.ruleChecks.filter(c => !c.passed);
    if (failed.length < 2) {
      throw new Error(`Expected at least 2 failed checks, got ${failed.length}`);
    }

    return `Status: ${res.status} with ${failed.length} failed checks: [${failed.map(f => f.title).join(', ')}]`;
  });

  // Summary
  console.log('\n================================================================================');
  console.log('                          STAGE 1 TEST RESULTS                                  ');
  console.log('================================================================================');

  let passedCount = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const prefix = `[${i + 1}/${results.length}]`;
    if (r.passed) {
      passedCount++;
      console.log(`${prefix} ✅ PASS [${r.id}] ${r.name} (${r.durationMs}ms)`);
      if (r.details) console.log(`       ℹ️  ${r.details}`);
    } else {
      console.log(`${prefix} ❌ FAIL [${r.id}] ${r.name} (${r.durationMs}ms)`);
      console.log(`       🚨 Error: ${r.error}`);
    }
  }

  console.log('\n================================================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log(`OVERALL STAGE 1 STATUS: ${passedCount === results.length ? '100% OPERATIONAL & VERIFIED' : 'FAILURES DETECTED'}`);
  console.log('================================================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runStage1Tests().catch(err => {
  console.error('Fatal Stage 1 test error:', err);
  process.exit(1);
});
