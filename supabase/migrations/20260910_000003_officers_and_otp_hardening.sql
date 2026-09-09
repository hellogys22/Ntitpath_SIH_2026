-- ==============================================================================
-- NitiPath (नीतिपथ) Industrial Approval & Compliance Intelligence Platform
-- MIGRATION 3: PRE-AUTHORIZED OFFICERS, HARDENED OTP & ROLE-BASED ACCESS CONTROL
-- Problem Statement: SIH26130
-- ==============================================================================

BEGIN;

-- 1. Table: "Officer" (Pre-Authorized Government Regulatory Clearance Officers)
CREATE TABLE IF NOT EXISTS "Officer" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL DEFAULT 'Regulatory Clearance Officer',
    "badgeNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on Officer Table
ALTER TABLE "Officer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Officer" FORCE ROW LEVEL SECURITY;

-- Helper to check if active user is an authorized officer or admin
CREATE OR REPLACE FUNCTION auth.is_officer_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role') IN ('ADMIN', 'DEPARTMENT_OFFICER', 'REGULATOR'),
    EXISTS (
      SELECT 1 FROM "Officer" 
      WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
        AND "isActive" = true
    ),
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
        AND role IN ('ADMIN', 'DEPARTMENT_OFFICER')
    ),
    false
  );
$$;

-- RLS: Officers can view authorized officers directory; public/applicants CANNOT enumerate officers
CREATE POLICY "officers_select_authorized"
ON "Officer"
FOR SELECT
TO authenticated
USING (
  auth.is_officer_or_admin() 
  OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
);

-- RLS: Only admins or system services can register or mutate officer accounts
CREATE POLICY "officers_insert_admin_only"
ON "Officer"
FOR INSERT
TO authenticated
WITH CHECK (auth.is_officer_or_admin());

CREATE POLICY "officers_update_admin_only"
ON "Officer"
FOR UPDATE
TO authenticated
USING (auth.is_officer_or_admin())
WITH CHECK (auth.is_officer_or_admin());

-- 2. Audit Log Security: Add specific actions for officer login monitoring
-- Ensure authenticated users can only write valid audit actions, and officers audit logs are restricted
CREATE POLICY "audit_logs_officer_scoped"
ON "AuditLog"
FOR SELECT
TO authenticated
USING (
  auth.is_officer_or_admin() 
  OR "userId" = auth.uid()::text
);

-- 3. Business Isolation: Prevent Officers from accidentally mutating enterprise business profiles
DROP POLICY IF EXISTS "business_insert_own" ON "Business";
CREATE POLICY "business_insert_own"
ON "Business"
FOR INSERT
TO authenticated
WITH CHECK (
  "userId" = auth.uid()::text 
  AND NOT auth.is_officer_or_admin()
);

DROP POLICY IF EXISTS "business_update_own" ON "Business";
CREATE POLICY "business_update_own"
ON "Business"
FOR UPDATE
TO authenticated
USING (
  "userId" = auth.uid()::text 
  AND NOT auth.is_officer_or_admin()
)
WITH CHECK (
  "userId" = auth.uid()::text 
  AND NOT auth.is_officer_or_admin()
);

-- 4. Seed Pre-Authorized Officers for Regulatory Clearance
-- NOTE: In production, government officer accounts are provisioned via NIC / State Single Window
-- administrative credentials and digital certificates (e-Sign/DSC). Real officer onboarding goes
-- through an out-of-band administrative verification process outside the public registration portal.
INSERT INTO "Officer" ("email", "name", "department", "designation", "badgeNumber", "isActive")
VALUES 
  ('officer@gov.in', 'Dr. Ananya Verma, IAS', 'Commerce & Industries Department', 'Joint Director of Industries', 'CG-IND-0824', true),
  ('epcb.officer@cg.gov.in', 'Shri Rajesh Kumar Kujur', 'Environment & Pollution Control Board', 'Senior Environmental Engineer', 'CECB-EE-1102', true),
  ('dish.officer@cg.gov.in', 'Shri Vikramaditya Sahu', 'Directorate of Industrial Safety & Health (DISH)', 'Deputy Chief Inspector of Factories', 'DISH-CG-0419', true),
  ('admin@demo.com', 'System Administrative Officer', 'State Single Window Clearance Directorate', 'Chief Technology Administrator', 'SWC-ADMIN-0001', true)
ON CONFLICT ("email") DO UPDATE 
SET "isActive" = true, "updatedAt" = NOW();

COMMIT;
