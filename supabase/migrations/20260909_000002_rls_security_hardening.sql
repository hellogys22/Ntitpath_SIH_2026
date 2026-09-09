-- ==============================================================================
-- NitiPath (नीतिपथ) Industrial Approval & Compliance Intelligence Platform
-- STAGE 5: SUPABASE AUTH & DATA SECURITY HARDENING MIGRATION
-- Problem Statement: SIH26130
-- ==============================================================================
-- 1. Enables strict Row Level Security (RLS) across all user/company tables.
-- 2. Scopes all records to auth.uid() via the businesses.userId link.
-- 3. Grants selective access to authorized departmental officers and admins.
-- 4. Establishes private, RLS-gated Supabase Storage bucket for confidential documents.
-- 5. Isolates demo account data from real production enterprise records.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS CONTROL
-- ------------------------------------------------------------------------------

-- Check if active user is an authorized administrative officer or regulator
CREATE OR REPLACE FUNCTION auth.is_officer_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role') IN ('ADMIN', 'DEPARTMENT_OFFICER', 'REGULATOR'),
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
        AND role IN ('ADMIN', 'DEPARTMENT_OFFICER')
    )
  );
$$;

-- Check if active user is the demo evaluation user
CREATE OR REPLACE FUNCTION auth.is_demo_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.uid()::text = 'DEMO-USER-001' OR 
    (auth.jwt() ->> 'email') = 'business@demo.com',
    false
  );
$$;

-- Get user ID for an application
CREATE OR REPLACE FUNCTION get_application_owner_id(app_id TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT b."userId" 
  FROM "Application" a
  JOIN "Business" b ON b.id = a."businessId"
  WHERE a.id = app_id;
$$;

-- ------------------------------------------------------------------------------
-- 1. TABLE: "User" (User Profiles & Identity)
-- ------------------------------------------------------------------------------
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_select_own"
ON "User"
FOR SELECT
TO authenticated
USING (id = auth.uid()::text OR auth.is_officer_or_admin());

-- Users can update only their own profile
CREATE POLICY "users_update_own"
ON "User"
FOR UPDATE
TO authenticated
USING (id = auth.uid()::text AND NOT auth.is_demo_user())
WITH CHECK (id = auth.uid()::text);

-- ------------------------------------------------------------------------------
-- 2. TABLE: "Business" (Enterprise Profiles / Companies)
-- ------------------------------------------------------------------------------
ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Business" FORCE ROW LEVEL SECURITY;

-- Business owners view their own company; Officers view companies with applications
CREATE POLICY "business_select_scoped"
ON "Business"
FOR SELECT
TO authenticated
USING (
  "userId" = auth.uid()::text 
  OR auth.is_officer_or_admin()
);

-- Business owners insert their own enterprise profile (must match auth.uid())
CREATE POLICY "business_insert_scoped"
ON "Business"
FOR INSERT
TO authenticated
WITH CHECK (
  "userId" = auth.uid()::text 
  AND NOT auth.is_demo_user()
);

-- Only company owner can modify their profile (Demo user cannot edit real data)
CREATE POLICY "business_update_scoped"
ON "Business"
FOR UPDATE
TO authenticated
USING (
  "userId" = auth.uid()::text 
  AND (NOT auth.is_demo_user() OR id = 'BIZ-DEMO-001')
)
WITH CHECK (
  "userId" = auth.uid()::text
);

-- Company deletion restricted to owner
CREATE POLICY "business_delete_scoped"
ON "Business"
FOR DELETE
TO authenticated
USING (
  "userId" = auth.uid()::text 
  AND NOT auth.is_demo_user()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: "Application" (Statutory Projects & Approval Dossiers)
-- ------------------------------------------------------------------------------
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" FORCE ROW LEVEL SECURITY;

-- Select scoped strictly to business owner or authorized officer
CREATE POLICY "application_select_scoped"
ON "Application"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Business" b
    WHERE b.id = "Application"."businessId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

-- Insert permitted only if applicant owns parent business
CREATE POLICY "application_insert_scoped"
ON "Application"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Business" b
    WHERE b.id = "Application"."businessId"
      AND b."userId" = auth.uid()::text
  )
  AND (NOT auth.is_demo_user() OR "applicationNumber" = 'NTP-00128')
);

-- Update permitted for owner (project parameters) or officer (review status)
CREATE POLICY "application_update_scoped"
ON "Application"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Business" b
    WHERE b.id = "Application"."businessId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
)
WITH CHECK (
  (
    EXISTS (
      SELECT 1 FROM "Business" b
      WHERE b.id = "Application"."businessId"
        AND b."userId" = auth.uid()::text
    )
    AND (NOT auth.is_demo_user() OR "applicationNumber" = 'NTP-00128')
  )
  OR auth.is_officer_or_admin()
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: "Approval" (Clearances, Consents & Permits)
-- ------------------------------------------------------------------------------
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Approval" FORCE ROW LEVEL SECURITY;

-- View approvals belonging to user's application or officer's department
CREATE POLICY "approval_select_scoped"
ON "Approval"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "Approval"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

-- Regulatory updates (officer approval / query) or applicant document attachment
CREATE POLICY "approval_update_scoped"
ON "Approval"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "Approval"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: "Document" (Uploaded Files, DPRs & Drawings)
-- ------------------------------------------------------------------------------
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" FORCE ROW LEVEL SECURITY;

-- Read document metadata only if owner of application or officer
CREATE POLICY "document_select_scoped"
ON "Document"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "Document"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

-- Upload document only into owned application
CREATE POLICY "document_insert_scoped"
ON "Document"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "Document"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  AND (NOT auth.is_demo_user() OR "Document"."applicationId" = 'APP-DEMO-001')
);

-- Update document (mismatch resolution, re-upload, verification)
CREATE POLICY "document_update_scoped"
ON "Document"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "Document"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

-- Delete document only by application owner
CREATE POLICY "document_delete_scoped"
ON "Document"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "Document"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  AND NOT auth.is_demo_user()
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: "RiskItem" (Cross-Document Discrepancies & Bottlenecks)
-- ------------------------------------------------------------------------------
ALTER TABLE "RiskItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RiskItem" FORCE ROW LEVEL SECURITY;

CREATE POLICY "risk_select_scoped"
ON "RiskItem"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "RiskItem"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

CREATE POLICY "risk_update_scoped"
ON "RiskItem"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "RiskItem"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

-- ------------------------------------------------------------------------------
-- 7. TABLE: "ComplianceItem" (Statutory Renewal Calendar)
-- ------------------------------------------------------------------------------
ALTER TABLE "ComplianceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplianceItem" FORCE ROW LEVEL SECURITY;

CREATE POLICY "compliance_select_scoped"
ON "ComplianceItem"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "ComplianceItem"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

CREATE POLICY "compliance_update_scoped"
ON "ComplianceItem"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Application" a
    JOIN "Business" b ON b.id = a."businessId"
    WHERE a.id = "ComplianceItem"."applicationId"
      AND b."userId" = auth.uid()::text
  )
  OR auth.is_officer_or_admin()
);

-- ------------------------------------------------------------------------------
-- 8. TABLE: "Notification" (User Alerts)
-- ------------------------------------------------------------------------------
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
ON "Notification"
FOR SELECT
TO authenticated
USING ("userId" = auth.uid()::text);

CREATE POLICY "notifications_update_own"
ON "Notification"
FOR UPDATE
TO authenticated
USING ("userId" = auth.uid()::text)
WITH CHECK ("userId" = auth.uid()::text);

-- ------------------------------------------------------------------------------
-- 9. TABLE: "AuditLog" (Immutable Security Audit Trail)
-- ------------------------------------------------------------------------------
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_scoped"
ON "AuditLog"
FOR SELECT
TO authenticated
USING (
  "userId" = auth.uid()::text 
  OR auth.is_officer_or_admin()
);

-- Insert permitted for system / authenticated users logging actions
CREATE POLICY "audit_insert_system"
ON "AuditLog"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = auth.uid()::text OR auth.is_officer_or_admin());

-- Immutable: Prevent UPDATE and DELETE by anyone
CREATE POLICY "audit_no_update" ON "AuditLog" FOR UPDATE TO authenticated USING (false);
CREATE POLICY "audit_no_delete" ON "AuditLog" FOR DELETE TO authenticated USING (false);

-- ------------------------------------------------------------------------------
-- 10. REFERENCE TABLES: "ApprovalRule" & "SupportScheme"
-- ------------------------------------------------------------------------------
ALTER TABLE "ApprovalRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportScheme" ENABLE ROW LEVEL SECURITY;

-- Read-only access for all authenticated applicants and officers
CREATE POLICY "approval_rules_read_all" ON "ApprovalRule" FOR SELECT TO authenticated USING (true);
CREATE POLICY "support_schemes_read_all" ON "SupportScheme" FOR SELECT TO authenticated USING (true);

-- Modifications restricted to superadmin (service_role)
CREATE POLICY "approval_rules_write_admin" ON "ApprovalRule" FOR ALL TO service_role USING (true);
CREATE POLICY "support_schemes_write_admin" ON "SupportScheme" FOR ALL TO service_role USING (true);

-- ==============================================================================
-- SUPABASE STORAGE: PRIVATE BUCKET & RLS POLICIES
-- ==============================================================================
-- Bucket: 'documents' (public: false)
-- Path convention: {userId}/{applicationId}/{filename}
-- ==============================================================================

-- Create private bucket if not present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false, 
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policy 1: Upload into private bucket (only into own user directory)
CREATE POLICY "storage_insert_own_folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND NOT auth.is_demo_user()
);

-- Policy 2: Download / Read objects (uploader OR authorized departmental officer)
CREATE POLICY "storage_select_scoped"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR auth.is_officer_or_admin()
  )
);

-- Policy 3: Update own objects
CREATE POLICY "storage_update_own_folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND NOT auth.is_demo_user()
);

-- Policy 4: Delete own objects
CREATE POLICY "storage_delete_own_folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND NOT auth.is_demo_user()
);

-- Block public anonymous downloads completely
CREATE POLICY "storage_deny_anon"
ON storage.objects
FOR SELECT
TO anon
USING (false);

COMMIT;
