const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootEnvPath = path.join(__dirname, '../.env');
const backendEnvPath = path.join(__dirname, '../backend/.env');

console.log('=== NITIPATH SUPABASE CONNECTION UTILITY ===\n');

// Check environment arguments
const args = process.argv.slice(2);
const projectRef = process.env.SUPABASE_PROJECT_REF || args[0];
const dbPassword = process.env.SUPABASE_DB_PASSWORD || args[1];

if (!process.env.SUPABASE_ACCESS_TOKEN && !projectRef) {
  console.log('Supabase CLI requires an Access Token or existing Project Ref.\n');
  console.log('Option 1: Using Supabase Access Token (Fully Automated)');
  console.log('  export SUPABASE_ACCESS_TOKEN=sbp_...');
  console.log('  node scripts/setupSupabase.cjs\n');
  console.log('Option 2: Using Existing Supabase Project');
  console.log('  node scripts/setupSupabase.cjs <project-ref> <db-password>\n');
  process.exit(1);
}

try {
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    console.log('1. Checking authenticated Supabase account...');
    const orgsRaw = execSync('npx supabase orgs list --output json', { encoding: 'utf8' });
    const orgs = JSON.parse(orgsRaw);
    if (!orgs || orgs.length === 0) {
      console.error('No organization found in Supabase account.');
      process.exit(1);
    }
    const orgId = orgs[0].id;
    console.log(`✓ Authenticated with organization: ${orgs[0].name} (${orgId})`);

    const projectName = 'Ntitpath_SIH_2026';
    console.log(`2. Checking or creating project "${projectName}"...`);
    
    // Check existing projects
    const projectsRaw = execSync('npx supabase projects list --output json', { encoding: 'utf8' });
    const projects = JSON.parse(projectsRaw);
    let target = projects.find(p => p.name === projectName || p.name.toLowerCase().includes('ntitpath'));

    if (!target) {
      console.log(`Creating project ${projectName}...`);
      const generatedPassword = 'Ntp_' + Math.random().toString(36).slice(-8) + 'A1!';
      const createOut = execSync(
        `npx supabase projects create "${projectName}" --org-id "${orgId}" --db-password "${generatedPassword}" --region ap-south-1 --output json`,
        { encoding: 'utf8' }
      );
      target = JSON.parse(createOut);
      console.log(`✓ Project created with ref: ${target.id}`);
    } else {
      console.log(`✓ Found existing project: ${target.name} (ref: ${target.id})`);
    }

    // Link project
    console.log(`3. Linking repo with project ref: ${target.id}...`);
    execSync(`npx supabase link --project-ref "${target.id}"`, { stdio: 'inherit' });

    // Push migrations
    console.log('4. Pushing database migrations...');
    execSync('npx supabase db push', { stdio: 'inherit' });
    console.log('✓ Migrations successfully pushed!');
  } else if (projectRef) {
    console.log(`Linking with project ref: ${projectRef}...`);
    const passFlag = dbPassword ? `-p "${dbPassword}"` : '';
    execSync(`npx supabase link --project-ref "${projectRef}" ${passFlag}`, { stdio: 'inherit' });
    console.log('✓ Project linked successfully!');
  }
} catch (err) {
  console.error('Error connecting to Supabase:', err.message);
  process.exit(1);
}
