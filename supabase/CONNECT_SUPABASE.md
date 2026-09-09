# Connecting NitiPath to Supabase

This repository includes full Supabase integration:
- Database schema and migrations in `supabase/migrations/`
- Private storage bucket and Row-Level Security policies
- Frontend client in `src/lib/supabase.ts`
- Backend client in `backend/src/config/supabase.ts`
- Supabase CLI project configuration in `supabase/config.toml`

---

## Option 1: Automated Connection via Personal Access Token (Recommended)

1. Go to your Supabase Account Settings:  
   👉 **[https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)**
2. Click **Generate New Token**, name it `NitiPath-SIH-2026`, and copy the token (`sbp_...`).
3. Run the automated setup script in your terminal:
   ```bash
   export SUPABASE_ACCESS_TOKEN="sbp_your_token_here"
   node scripts/setupSupabase.cjs
   ```
   This will:
   - Authenticate with your Supabase account
   - Automatically create the project named **`Ntitpath_SIH_2026`** (in `ap-south-1` Mumbai region)
   - Link the repository to the project
   - Push all tables, RLS policies, and private storage bucket configurations
   - Populate your `.env` files

---

## Option 2: Manual Linking with an Existing Project

If you already created the project on the Supabase dashboard:

1. Copy your **Project Reference ID** from:  
   `https://supabase.com/dashboard/project/<project-ref>/settings/general`
2. Run the link command:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
3. Push the migrations:
   ```bash
   npx supabase db push
   ```
4. Set your environment variables:

**Root `.env` (Frontend):**
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

**`backend/.env` (Backend):**
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:[YOUR-DB-PASSWORD]@db.<your-project-ref>.supabase.co:5432/postgres?schema=public"
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```
