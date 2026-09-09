# NitiPath (नीतिपथ) — Stage 5: Supabase Auth & Data Security Hardening Audit

**Problem Statement**: SIH26130 — Industrial Approval & Compliance Intelligence Platform  
**Audit Date**: September 9, 2026  
**Scope**: Complete Row Level Security (RLS) enforcement, private Supabase Storage gating, and demo sandbox isolation.

---

## Executive Summary

Stage 5 hardens the multi-tenant data architecture of NitiPath. Prior to this hardening, database tables were susceptible to broad authenticated queries without deep tenant scoping, document uploads were exposed via public static directories, and demo session actions could potentially collide with production business filings.

With Stage 5 completed:
1. **100% of Relational Tables** enforce Row Level Security (`FORCE ROW LEVEL SECURITY`) with deep ownership scoping through `Business."userId" = auth.uid()::text`.
2. **Document Storage is 100% Private**: The Supabase Storage bucket `documents` has `public: false`, requires authenticated tokens, and validates directory paths matching `{userId}/{applicationId}/{filename}`. The Express public static `/uploads` mount has been decommissioned.
3. **Demo User Sandbox Isolation**: The demo user (`DEMO-USER-001` / `business@demo.com`) is strictly isolated to its pre-seeded enterprise dossier (`NTP-00128` / `Raipur Fresh Foods`). Destructive operations (`DELETE`) are blocked, cross-enterprise writes are rejected at both API and database layers, and a dedicated `POST /api/auth/demo-reset` endpoint enables clean state restoration.

---

## 1. Table-by-Table RLS Policy Matrix

The SQL migration `supabase/migrations/20260909_rls_security_hardening.sql` implements the following policies:

| Table | Sensitive Data Stored | Pre-Hardening State | Hardened RLS Policy | Scoped Ownership Logic |
| :--- | :--- | :--- | :--- | :--- |
| **`User`** | Email, hashed password, phone, full name, role | Open read for authenticated | `users_select_own`<br>`users_update_own` | `id = auth.uid()::text`<br>Officer bypass: `auth.is_officer_or_admin()` |
| **`Business`** | PAN, GSTIN, CIN, turnover, capital investment, address | Open read across tenants | `business_select_scoped`<br>`business_insert_scoped`<br>`business_update_scoped`<br>`business_delete_scoped` | `"userId" = auth.uid()::text`<br>Insert/Update/Delete blocked for demo user on real enterprise IDs |
| **`Application`** | Project cost, land area, water/power demands, hazardous flags | Queryable by any authenticated user | `application_select_scoped`<br>`application_insert_scoped`<br>`application_update_scoped` | Scoped via parent business:<br>`EXISTS (SELECT 1 FROM Business b WHERE b.id = "businessId" AND b."userId" = auth.uid()::text)` |
| **`Approval`** | Statutory clearances, consent orders, department fees | Visible across applicants | `approval_select_scoped`<br>`approval_update_scoped` | Scoped via `Application -> Business -> userId = auth.uid()::text`<br>Officer bypass for jurisdictional processing |
| **`Document`** | Sensitive DPRs, land deed records, site blueprints, balance sheets | Accessible by ID guessing | `document_select_scoped`<br>`document_insert_scoped`<br>`document_update_scoped`<br>`document_delete_scoped` | Deeply scoped via `Application -> Business -> userId = auth.uid()::text`<br>Physical path validation |
| **`RiskItem`** | Regulatory mismatches, missing NOC flags, penalty warnings | Unscoped queries | `risk_select_scoped`<br>`risk_update_scoped` | Scoped via `Application -> Business -> userId = auth.uid()::text` |
| **`ComplianceItem`** | Emission return dates, hazardous waste returns, water cess dates | Unscoped queries | `compliance_select_scoped`<br>`compliance_update_scoped` | Scoped via `Application -> Business -> userId = auth.uid()::text` |
| **`Notification`** | Officer queries, hearing alerts, deficiency intimations | Accessible if ID known | `notifications_select_own`<br>`notifications_update_own` | `"userId" = auth.uid()::text` |
| **`AuditLog`** | Security events, document verification logs, status transitions | Writable by any role | `audit_select_scoped`<br>`audit_insert_system`<br>`audit_no_update`<br>`audit_no_delete` | Owner or Officer read.<br>**Immutable**: Updates (`false`) and Deletes (`false`) strictly rejected for all users. |
| **`ApprovalRule`** | State & central single-window clearance matrices | Reference data | `approval_rules_read_all`<br>`approval_rules_write_admin` | `SELECT` open to all authenticated users.<br>Mutation restricted exclusively to `service_role`. |
| **`SupportScheme`** | Industrial incentives, capital subsidies, interest subvention | Reference data | `support_schemes_read_all`<br>`support_schemes_write_admin` | `SELECT` open to all authenticated users.<br>Mutation restricted exclusively to `service_role`. |

---

## 2. Private Document Storage & URL Gating

### Vulnerability Eliminated
Previously, documents were stored under `backend/uploads/` and served publicly via Express:
```typescript
// INSECURE (REMOVED in Stage 5):
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```
This allowed anyone with a guessed filename to view confidential project blueprints and DPRs without authentication.

### Hardened Architecture
1. **Private Bucket**: Supabase Storage bucket `documents` created with `public: false` and strict 20MB file size limits for supported MIME types (`pdf`, `docx`, `png`, `jpeg`).
2. **Storage RLS Policies on `storage.objects`**:
   - `storage_insert_own_folder`: Requires target key prefix to match `auth.uid()::text`.
   - `storage_select_scoped`: Authenticated user must own the folder OR hold `ADMIN` / `DEPARTMENT_OFFICER` role.
   - `storage_deny_anon`: Anonymous public downloads explicitly return `false`.
3. **Time-Limited Signed URLs**: Generated via `StorageService.generateSignedUrl()` with a default 15-minute expiration (`900s`).
4. **Authenticated Streaming Proxy**: `GET /api/documents/:id/download` streams file bytes directly with:
   - Verification that `document.application.business.userId === requestingUserId` (or officer).
   - HTTP response header `Cache-Control: private, no-cache, no-store, must-revalidate`.

---

## 3. Demo User Sandbox Isolation

The demo account allows evaluators and SIH jury members to test NitiPath without creating credentials. To prevent cross-contamination:

### Security Boundaries
- **Demo Identity**: ID `DEMO-USER-001` or email `business@demo.com`.
- **Target Enterprise Dossier**: `NTP-00128` (Raipur Fresh Foods Mega Food Park).
- **Backend Middleware**: `backend/src/middleware/demoIsolation.middleware.ts`:
  - **DELETE Blocked**: Returns HTTP `403 Forbidden` (`"Demo Sandbox Restriction: Deletion is disabled in demonstration mode."`).
  - **Cross-Dossier Access Blocked**: Any mutation targeting an application or business ID other than `NTP-00128` / `APP-DEMO-001` returns HTTP `403 Forbidden`.
  - **State Reset**: Evaluators can trigger `POST /api/auth/demo-reset` at any time to restore the pristine demo state.
- **Database RLS Mirror**: PostgreSQL RLS policies in `20260909_rls_security_hardening.sql` check `NOT auth.is_demo_user()` on inserts and deletes of real business profiles.

---

## 4. How to Apply the Migration to Supabase

To apply this security hardening to your active Supabase project:

```bash
# Option A: Using the Supabase CLI
supabase db push

# Option B: Directly via Supabase SQL Editor
# 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/<your-project-id>
# 2. Go to SQL Editor -> New Query
# 3. Paste the contents of supabase/migrations/20260909_rls_security_hardening.sql
# 4. Click Run
```

---

## 5. Verification Checklist

- [x] RLS enabled and forced on all 10 application and security tables.
- [x] Scoped read/write policies referencing `auth.uid()::text`.
- [x] Immutable `AuditLog` table (updates and deletes strictly blocked).
- [x] Supabase Storage bucket `documents` marked private (`public: false`).
- [x] Express static directory `/uploads` completely removed.
- [x] Authenticated streaming and signed URL generation implemented in `StorageService`.
- [x] Demo isolation middleware active on application, business, and document routes.
- [x] `POST /api/auth/demo-reset` implemented to restore evaluation state.
- [x] Backend compiles with zero errors (`npm run build`).
- [x] Frontend compiles with zero errors (`npm run build`).
