-- ==============================================================================
-- NitiPath (नीतिपथ) Industrial Approval & Compliance Intelligence Platform
-- MIGRATION 1: INITIAL POSTGRESQL SCHEMA SETUP
-- Problem Statement: SIH26130
-- ==============================================================================

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: "User"
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BUSINESS_USER',
    "department" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: "Business"
CREATE TABLE IF NOT EXISTS "Business" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL DEFAULT 'Private Limited',
    "pan" TEXT,
    "gstin" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Chhattisgarh',
    "pinCode" TEXT,
    "sector" TEXT NOT NULL,
    "investmentCr" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "employees" INTEGER NOT NULL DEFAULT 50,
    "landAcres" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "builtUpAreaSqFt" DOUBLE PRECISION DEFAULT 10000.0,
    "powerRequirementKw" DOUBLE PRECISION DEFAULT 250.0,
    "waterRequirementKld" DOUBLE PRECISION DEFAULT 50.0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Table: "Application"
CREATE TABLE IF NOT EXISTS "Application" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "applicationNumber" TEXT NOT NULL UNIQUE,
    "businessId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "description" TEXT,
    "pollutionCategory" TEXT NOT NULL DEFAULT 'ORANGE',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "readinessScore" INTEGER NOT NULL DEFAULT 72,
    "riskLevel" TEXT NOT NULL DEFAULT 'HIGH',
    "estimatedDays" INTEGER NOT NULL DEFAULT 65,
    "parallelTracksCount" INTEGER NOT NULL DEFAULT 3,
    "totalApprovals" INTEGER NOT NULL DEFAULT 18,
    "completedApprovals" INTEGER NOT NULL DEFAULT 8,
    "criticalPathApprovals" INTEGER NOT NULL DEFAULT 4,
    "submittedAt" TIMESTAMPTZ,
    "approvedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "Application_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Table: "Approval"
CREATE TABLE IF NOT EXISTS "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "applicationId" TEXT NOT NULL,
    "approvalCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "slaDays" INTEGER NOT NULL DEFAULT 30,
    "expectedDays" INTEGER NOT NULL DEFAULT 25,
    "parallelGroupId" TEXT,
    "isCriticalPath" BOOLEAN NOT NULL DEFAULT false,
    "queryComment" TEXT,
    "officerNotes" TEXT,
    "requiredDocsJson" TEXT,
    "dependenciesJson" TEXT,
    "submittedAt" TIMESTAMPTZ,
    "approvedAt" TIMESTAMPTZ,
    "dueDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "Approval_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Table: "ApprovalRule"
CREATE TABLE IF NOT EXISTS "ApprovalRule" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sector" TEXT NOT NULL,
    "scale" TEXT NOT NULL DEFAULT 'MSME',
    "approvalCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "slaDays" INTEGER NOT NULL DEFAULT 30,
    "requiredDocsJson" TEXT NOT NULL,
    "dependenciesJson" TEXT NOT NULL,
    "triggersJson" TEXT,
    "parallelGroup" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table: "Document"
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "applicationId" TEXT NOT NULL,
    "approvalId" TEXT,
    "docType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT,
    "filePath" TEXT,
    "fileSizeBytes" INTEGER,
    "mimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_UPLOADED',
    "extractedText" TEXT,
    "extractedMetadataJson" TEXT,
    "mismatchDetailsJson" TEXT,
    "uploadedAt" TIMESTAMPTZ,
    "verifiedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "Approval" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. Table: "RiskItem"
CREATE TABLE IF NOT EXISTS "RiskItem" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "applicationId" TEXT NOT NULL,
    "approvalId" TEXT,
    "riskType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "RiskItem_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RiskItem_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "Approval" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 8. Table: "ComplianceItem"
CREATE TABLE IF NOT EXISTS "ComplianceItem" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "regulation" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'ANNUAL',
    "dueDate" TIMESTAMPTZ NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "lastFiledDate" TIMESTAMPTZ,
    "penaltyRisk" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "ComplianceItem_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 9. Table: "Notification"
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 10. Table: "AuditLog"
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    "applicationId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 11. Table: "SupportScheme"
CREATE TABLE IF NOT EXISTS "SupportScheme" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "schemeCode" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "subsidyPercentage" DOUBLE PRECISION NOT NULL DEFAULT 35.0,
    "maxCapCr" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "eligibilityCriteriaJson" TEXT NOT NULL,
    "applicationUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
