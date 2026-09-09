const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Error: Please set SUPABASE_ACCESS_TOKEN environment variable.');
  process.exit(1);
}
const projectRef = process.env.SUPABASE_PROJECT_REF || 'hjxqszcrzdnqsbqrrldu';

console.log(`=== DEPLOYING SCHEMAS & RLS POLICIES TO SUPABASE (${projectRef}) ===\n`);

function executeSql(query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query });
    const req = https.request(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve(body);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  try {
    // 1. Initial Schema
    console.log('1. Applying Migration 1: Initial Schema (Tables & Constraints)...');
    const mig1Path = path.join(__dirname, '../supabase/migrations/20260909_000001_initial_schema.sql');
    const mig1Sql = fs.readFileSync(mig1Path, 'utf8');
    await executeSql(mig1Sql);
    console.log('✓ Migration 1 applied successfully!');

    // 2. RLS Hardening & Storage
    console.log('2. Applying Migration 2: Row Level Security & Private Storage Bucket...');
    const mig2Path = path.join(__dirname, '../supabase/migrations/20260909_000002_rls_security_hardening.sql');
    const mig2Sql = fs.readFileSync(mig2Path, 'utf8');
    await executeSql(mig2Sql);
    console.log('✓ Migration 2 applied successfully!');

    // 3. Verification: Check public tables
    console.log('\n3. Verifying deployed tables...');
    const tables = await executeSql(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Public tables in Supabase:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // 4. Verification: Check active RLS policies
    console.log('\n4. Verifying Row Level Security policies...');
    const policies = await executeSql(`
      SELECT tablename, policyname, permissive, roles, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      ORDER BY tablename, policyname;
    `);
    console.log(`Active RLS policies: ${policies.length}`);
    policies.forEach(p => console.log(`  - [${p.tablename}] ${p.policyname} (${p.cmd})`));

    // 5. Verification: Check Storage Bucket
    console.log('\n5. Verifying Storage Buckets...');
    const buckets = await executeSql(`
      SELECT id, name, public, file_size_limit 
      FROM storage.buckets;
    `);
    console.log('Storage buckets:');
    buckets.forEach(b => console.log(`  - ${b.id} (public: ${b.public}, limit: ${b.file_size_limit} bytes)`));

    console.log('\n🎉 ALL SUPABASE SCHEMAS & POLICIES SUCCESSFULLY DEPLOYED TO CLOUD!');
  } catch (err) {
    console.error('Deployment error:', err.message);
    process.exit(1);
  }
}

run();
