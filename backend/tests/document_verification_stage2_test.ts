import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5001/api';

async function runStage2Tests() {
  console.log('=====================================================');
  console.log('🚀 RUNNING STAGE 2: UPLOAD / VIEW / RE-UPLOAD TEST SUITE');
  console.log('=====================================================\n');

  // 1. Authenticate as Business Owner
  console.log('Step 1: Logging in as business@demo.com...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'business@demo.com',
      password: 'demo123',
    }),
  });
  const loginData = (await loginRes.json()) as any;
  const token = loginData.data?.token;
  if (!token) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log('✅ Authenticated successfully.\n');

  // 2. Fetch business application ID
  console.log('Step 2: Fetching active business application...');
  const appRes = await fetch(`${API_BASE}/applications`, { headers: authHeaders });
  const appData = (await appRes.json()) as any;
  const app = appData.data?.[0];
  if (!app) {
    throw new Error('No active application found for business user');
  }
  const applicationId = app.id;
  console.log(`✅ Target Application ID: ${applicationId}\n`);

  // 3. Create a temporary sample PDF file on disk
  const tempFilePath = path.join(__dirname, 'test_site_layout_plan.pdf');
  fs.writeFileSync(tempFilePath, '%PDF-1.4\n%Site Plan Layout with 10,000 sq ft built-up area\n%%EOF');
  const fileBytes = fs.readFileSync(tempFilePath);

  // 4. Test Case 1: Upload a document that fails verification (e.g. area mismatch 10,000 sq ft vs 12,500 sq ft in DPR)
  console.log('Step 3: Testing File Upload with Mismatched Area (10,000 sq ft vs 12,500 sq ft)...');
  const form1 = new FormData();
  form1.append('applicationId', applicationId);
  form1.append('name', 'Site Master Layout Plan');
  form1.append('docType', 'SITE_PLAN');
  form1.append('file', new Blob([fileBytes], { type: 'application/pdf' }), 'test_site_layout_plan.pdf');
  form1.append('extractedMetadata', JSON.stringify({
    builtUpAreaSqFt: 10000,
    architectRegNumber: 'CA/2021/89412',
    khasraNumber: '108/2',
    areaMismatch: true,
  }));

  const uploadRes1 = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: form1,
  });

  const uploadJson1 = (await uploadRes1.json()) as any;
  const uploadedDoc = uploadJson1.data;
  console.log(`Document ID: ${uploadedDoc.id}`);
  console.log(`Document Status: ${uploadedDoc.status}`);
  console.log(`Current Version: ${uploadedDoc.currentVersion}`);

  if (uploadedDoc.status !== 'NEEDS_CORRECTION') {
    throw new Error(`Expected status NEEDS_CORRECTION on initial upload, got: ${uploadedDoc.status}`);
  }
  if (uploadedDoc.currentVersion !== 1) {
    throw new Error(`Expected currentVersion 1, got: ${uploadedDoc.currentVersion}`);
  }
  console.log('✅ Test 1 Passed: Upload automatically ran verification, set status to NEEDS_CORRECTION, and created v1.\n');

  // 5. Test Case 2: View Document via Signed URL
  console.log('Step 4: Testing Signed URL Generation & Inline Preview Access...');
  const signedUrlRes = await fetch(`${API_BASE}/documents/${uploadedDoc.id}/signed-url`, {
    headers: authHeaders,
  });
  const signedUrlJson = (await signedUrlRes.json()) as any;
  const { signedUrl, fileName, isSupabase } = signedUrlJson.data;
  console.log(`Generated Signed URL: ${signedUrl}`);
  console.log(`Storage Mechanism: ${isSupabase ? 'Supabase Storage Signed URL' : 'Authenticated Inline Gated Stream'}`);

  if (!signedUrl) {
    throw new Error('Signed URL was not generated.');
  }

  // Test downloading or previewing via signed URL
  const previewUrl = signedUrl.startsWith('http') ? signedUrl : `http://localhost:5001${signedUrl}`;
  const streamRes = await fetch(previewUrl, {
    headers: authHeaders,
  });

  const contentDisposition = streamRes.headers.get('content-disposition') || '';
  const contentType = streamRes.headers.get('content-type') || '';
  console.log(`Preview Content-Disposition: "${contentDisposition}"`);
  console.log(`Preview Content-Type: "${contentType}"`);

  const supportsInline = contentType.includes('application/pdf') || contentType.includes('image') || contentDisposition.includes('inline');
  if (!supportsInline) {
    throw new Error(`Expected inline preview support (PDF/Image or Content-Disposition: inline), got type: ${contentType}, disposition: ${contentDisposition}`);
  }
  console.log('✅ Test 2 Passed: Signed URL generated and verified to support inline preview without forcing download.\n');

  // 6. Test Case 3: Re-upload corrected document (12,500 sq ft)
  console.log('Step 5: Testing Document Re-upload with Corrected Dimensions (12,500 sq ft)...');
  const tempCorrectedPath = path.join(__dirname, 'test_site_layout_plan_rev2.pdf');
  fs.writeFileSync(tempCorrectedPath, '%PDF-1.4\n%Site Plan Layout Rev-2 Aligned to 12,500 sq ft\n%%EOF');
  const correctedBytes = fs.readFileSync(tempCorrectedPath);

  const form2 = new FormData();
  form2.append('file', new Blob([correctedBytes], { type: 'application/pdf' }), 'test_site_layout_plan_rev2.pdf');
  form2.append('extractedMetadata', JSON.stringify({
    builtUpAreaSqFt: 12500,
    architectRegNumber: 'CA/2021/89412',
    khasraNumber: '108/2',
    areaMismatch: false,
  }));

  const reuploadRes = await fetch(`${API_BASE}/documents/${uploadedDoc.id}/reupload`, {
    method: 'POST',
    headers: authHeaders,
    body: form2,
  });

  const reuploadJson = (await reuploadRes.json()) as any;
  const reuploadedDoc = reuploadJson.data;
  console.log(`Updated Document Status: ${reuploadedDoc.status}`);
  console.log(`Updated Current Version: ${reuploadedDoc.currentVersion}`);

  if (reuploadedDoc.status !== 'VERIFIED') {
    throw new Error(`Expected re-uploaded document status to be VERIFIED, got: ${reuploadedDoc.status}`);
  }
  if (reuploadedDoc.currentVersion !== 2) {
    throw new Error(`Expected currentVersion to increment to 2, got: ${reuploadedDoc.currentVersion}`);
  }
  console.log('✅ Test 3 Passed: Re-upload created v2, re-ran verification, and transitioned status to VERIFIED.\n');

  // 7. Test Case 4: Verify Version History
  console.log('Step 6: Testing Version History Retrieval...');
  const versionsRes = await fetch(`${API_BASE}/documents/${uploadedDoc.id}/versions`, {
    headers: authHeaders,
  });
  const versionsJson = (await versionsRes.json()) as any;
  const versions = versionsJson.data;
  console.log(`Total Versions Recorded: ${versions.length}`);
  versions.forEach((v: any) => {
    console.log(` - v${v.versionNumber}: ${v.fileName} [Status: ${v.status}, Uploaded: ${v.uploadedAt}]`);
  });

  if (versions.length < 2) {
    throw new Error(`Expected at least 2 versions, found: ${versions.length}`);
  }
  const v1 = versions.find((v: any) => v.versionNumber === 1);
  const v2 = versions.find((v: any) => v.versionNumber === 2);

  if (!v1 || v1.status !== 'NEEDS_CORRECTION') {
    throw new Error(`Expected version 1 to preserve NEEDS_CORRECTION status, got: ${v1?.status}`);
  }
  if (!v2 || v2.status !== 'VERIFIED') {
    throw new Error(`Expected version 2 to have VERIFIED status, got: ${v2?.status}`);
  }
  console.log('✅ Test 4 Passed: Version history preserves historical versions (v1: NEEDS_CORRECTION, v2: VERIFIED).\n');

  // Clean up test temp files
  try {
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempCorrectedPath);
  } catch (e) {}

  console.log('=====================================================');
  console.log('🎉 ALL STAGE 2 BACKEND VERIFICATION TESTS PASSED (4/4)');
  console.log('=====================================================');
}

runStage2Tests().catch((err) => {
  console.error('❌ Stage 2 Test Suite Failed:', err.message);
  process.exit(1);
});
