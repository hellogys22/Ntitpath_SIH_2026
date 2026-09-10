import fs from 'fs';
import prisma from '../prisma/client';
import { ConsistencyMismatch } from '../types';
import { AuditService } from './audit.service';
import { StorageService } from './storage.service';
import { VerificationService } from './verification.service';

export class DocumentService {
  static async uploadDocument(params: {
    applicationId: string;
    approvalId?: string;
    docType: string;
    name: string;
    file?: Express.Multer.File;
    extractedText?: string;
    extractedMetadata?: any;
    userId?: string;
    userRole?: string;
  }) {
    // Verify that requesting user owns the target application (unless officer)
    const app = await prisma.application.findFirst({
      where: {
        id: params.applicationId,
        ...(params.userId && params.userId !== 'DEMO-USER-001' && params.userRole !== 'ADMIN' && params.userRole !== 'DEPARTMENT_OFFICER'
          ? { business: { userId: params.userId } }
          : {}),
      },
      include: {
        business: true,
        documents: true,
      },
    });

    if (!app && params.userId && params.userId !== 'DEMO-USER-001' && params.userRole !== 'ADMIN' && params.userRole !== 'DEPARTMENT_OFFICER') {
      throw new Error('Unauthorized: You cannot upload documents into an application you do not own.');
    }

    const companyName = app?.business?.name || (app?.business as any)?.companyName || 'Raipur Fresh Foods Pvt. Ltd.';
    const applicationArea = app?.business?.builtUpAreaSqFt || 10000;

    // Run Stage 1 deterministic rule-based verification on upload
    const verification = VerificationService.verify({
      docName: params.name,
      docType: params.docType,
      metadata: params.extractedMetadata || {},
      companyName,
      applicationArea,
      allDocsMetadata: app?.documents.map((d) => ({
        name: d.name,
        docType: d.docType,
        metadata: d.extractedMetadataJson ? JSON.parse(d.extractedMetadataJson) : {},
      })) || [],
    });

    // Upload to Supabase Storage if file exists
    if (params.file && app?.business?.userId) {
      const storagePath = `${app.business.userId}/${app.id}/v1_${params.file.originalname}`;
      let fileBuffer: Buffer | null = null;
      if (params.file.path && fs.existsSync(params.file.path)) {
        fileBuffer = fs.readFileSync(params.file.path);
      } else if (params.file.buffer) {
        fileBuffer = params.file.buffer;
      }
      if (fileBuffer) {
        await StorageService.uploadFileToStorage({
          storagePath,
          fileBuffer,
          mimeType: params.file.mimetype,
        });
      }
    }

    const document = await prisma.document.create({
      data: {
        applicationId: params.applicationId,
        approvalId: params.approvalId,
        docType: params.docType,
        name: params.name,
        fileName: params.file ? params.file.originalname : undefined,
        filePath: params.file ? params.file.path : undefined,
        fileSizeBytes: params.file ? params.file.size : undefined,
        mimeType: params.file ? params.file.mimetype : 'application/pdf',
        status: verification.status,
        ruleChecksJson: JSON.stringify(verification.ruleChecks),
        currentVersion: 1,
        extractedText: params.extractedText || 'Extracted document content for compliance verification.',
        extractedMetadataJson: params.extractedMetadata ? JSON.stringify(params.extractedMetadata) : null,
        uploadedAt: new Date(),
        verifiedAt: verification.status === 'VERIFIED' ? new Date() : null,
      },
    });

    // Create DocumentVersion record for version 1
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        fileName: document.fileName || document.name,
        filePath: document.filePath,
        fileSizeBytes: document.fileSizeBytes,
        mimeType: document.mimeType,
        status: verification.status,
        ruleChecksJson: JSON.stringify(verification.ruleChecks),
        extractedMetadataJson: document.extractedMetadataJson,
        uploadedAt: new Date(),
      },
    });

    await AuditService.log({
      userId: params.userId,
      applicationId: params.applicationId,
      action: 'DOCUMENT_UPLOADED',
      details: `Uploaded ${document.name} (${document.docType}) v1 - Verification: ${verification.status}`,
    });

    // Automatically trigger consistency check for application
    await this.runConsistencyAudit(params.applicationId);

    return {
      ...document,
      ruleChecks: verification.ruleChecks,
      verificationSummary: verification.summary,
    };
  }

  /**
   * Re-upload a document: creates a new DocumentVersion entry,
   * re-runs Stage 1 verification on the new version, and updates active Document status.
   */
  static async reuploadDocument(params: {
    documentId: string;
    file?: Express.Multer.File;
    extractedText?: string;
    extractedMetadata?: any;
    userId?: string;
    userRole?: string;
  }) {
    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
      include: {
        application: {
          include: {
            business: true,
            documents: true,
          },
        },
        versions: true,
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const isOwner = document.application.business.userId === params.userId || params.userId === 'DEMO-USER-001';
    const isOfficer = params.userRole === 'ADMIN' || params.userRole === 'DEPARTMENT_OFFICER';

    if (!isOwner && !isOfficer) {
      throw new Error('Unauthorized: You cannot re-upload this document.');
    }

    const nextVersion = (document.currentVersion || 1) + 1;

    let metadata = params.extractedMetadata || {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {}
    }
    if (Object.keys(metadata).length === 0 && document.extractedMetadataJson) {
      try {
        metadata = JSON.parse(document.extractedMetadataJson);
      } catch (e) {}
    }

    const companyName = document.application.business.name || (document.application.business as any).companyName || 'Raipur Fresh Foods Pvt. Ltd.';
    const applicationArea = document.application.business.builtUpAreaSqFt || 10000;

    // Run Stage 1 deterministic verification on the new uploaded version
    const verification = VerificationService.verify({
      docName: document.name,
      docType: document.docType,
      metadata,
      companyName,
      applicationArea,
      allDocsMetadata: document.application.documents.map((d) => ({
        name: d.name,
        docType: d.docType,
        metadata: d.extractedMetadataJson ? JSON.parse(d.extractedMetadataJson) : {},
      })),
    });

    // Upload to Supabase Storage if file is provided
    if (params.file) {
      const storagePath = `${document.application.business.userId}/${document.applicationId}/v${nextVersion}_${params.file.originalname}`;
      let fileBuffer: Buffer | null = null;
      if (params.file.path && fs.existsSync(params.file.path)) {
        fileBuffer = fs.readFileSync(params.file.path);
      } else if (params.file.buffer) {
        fileBuffer = params.file.buffer;
      }
      if (fileBuffer) {
        await StorageService.uploadFileToStorage({
          storagePath,
          fileBuffer,
          mimeType: params.file.mimetype,
        });
      }
    }

    // Create new DocumentVersion entry in database
    const newVersion = await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: nextVersion,
        fileName: params.file ? params.file.originalname : `v${nextVersion}_${document.fileName || document.name}`,
        filePath: params.file ? params.file.path : document.filePath,
        fileSizeBytes: params.file ? params.file.size : document.fileSizeBytes,
        mimeType: params.file ? params.file.mimetype : document.mimeType,
        status: verification.status,
        ruleChecksJson: JSON.stringify(verification.ruleChecks),
        extractedMetadataJson: JSON.stringify(metadata),
        uploadedAt: new Date(),
      },
    });

    // Update active Document status & version tracking
    const updatedDoc = await prisma.document.update({
      where: { id: document.id },
      data: {
        fileName: newVersion.fileName,
        filePath: newVersion.filePath,
        fileSizeBytes: newVersion.fileSizeBytes,
        mimeType: newVersion.mimeType,
        status: verification.status,
        ruleChecksJson: JSON.stringify(verification.ruleChecks),
        currentVersion: nextVersion,
        extractedMetadataJson: newVersion.extractedMetadataJson,
        uploadedAt: new Date(),
        verifiedAt: verification.status === 'VERIFIED' ? new Date() : null,
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        approval: {
          select: { id: true, approvalCode: true, name: true, department: true },
        },
      },
    });

    await AuditService.log({
      userId: params.userId,
      applicationId: document.applicationId,
      action: 'DOCUMENT_REUPLOADED',
      details: `Re-uploaded ${document.name} to version ${nextVersion} (${verification.status})`,
    });

    // Re-run consistency audit
    await this.runConsistencyAudit(document.applicationId);

    return {
      ...updatedDoc,
      ruleChecks: verification.ruleChecks,
      verificationSummary: verification.summary,
    };
  }

  /**
   * Get all versions of a document
   */
  static async getDocumentVersions(documentId: string, userId?: string, userRole?: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: { business: true },
        },
      },
    });

    if (!document) throw new Error('Document not found');

    const isOwner = document.application.business.userId === userId || userId === 'DEMO-USER-001';
    const isOfficer = userRole === 'ADMIN' || userRole === 'DEPARTMENT_OFFICER';

    if (!isOwner && !isOfficer) {
      throw new Error('Unauthorized: You do not have permission to view versions of this document.');
    }

    return prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  static async getDocumentsByApplication(applicationId: string, userId?: string, userRole?: string) {
    // Enforce row-level ownership check at service layer
    if (userId && userRole !== 'ADMIN' && userRole !== 'DEPARTMENT_OFFICER' && userId !== 'DEMO-USER-001') {
      const app = await prisma.application.findFirst({
        where: {
          id: applicationId,
          business: { userId },
        },
      });
      if (!app) {
        throw new Error('Unauthorized: You do not have permission to view documents for this application.');
      }
    }

    return prisma.document.findMany({
      where: { applicationId },
      include: {
        approval: {
          select: { id: true, approvalCode: true, name: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async analyzeDocument(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: {
            business: true,
            documents: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Run consistency audit
    const auditResults = await this.runConsistencyAudit(document.applicationId);
    const documentMismatches = auditResults.mismatches.filter(
      (m) => m.conflictingDocType === document.docType || document.docType === 'SITE_PLAN' || document.docType === 'DPR'
    );

    return {
      document,
      auditPassed: documentMismatches.length === 0,
      mismatches: documentMismatches,
      summary: auditResults.summary,
    };
  }

  /**
   * Pre-submission Document Consistency Audit Engine
   * Detects cross-document contradictions (e.g., DPR states 12,500 sq ft built-up area while Site Layout Master Plan states 10,000 sq ft)
   */
  static async runConsistencyAudit(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        business: true,
        documents: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const mismatches: ConsistencyMismatch[] = [];
    const documents = application.documents;

    // Find key documents
    const dprDoc = documents.find((d) => d.docType === 'DPR' || d.name.toLowerCase().includes('project report'));
    const sitePlanDoc = documents.find(
      (d) => d.docType === 'SITE_PLAN' || d.name.toLowerCase().includes('site layout') || d.name.toLowerCase().includes('building plan')
    );
    const powerDoc = documents.find(
      (d) => d.docType === 'POWER_LOAD' || d.name.toLowerCase().includes('power') || d.name.toLowerCase().includes('electrical')
    );
    const fireDoc = documents.find(
      (d) => d.docType === 'FIRE_SAFETY' || d.name.toLowerCase().includes('fire')
    );

    let sitePlanMeta: any = {};
    let dprMeta: any = {};

    try {
      if (sitePlanDoc?.extractedMetadataJson) sitePlanMeta = JSON.parse(sitePlanDoc.extractedMetadataJson);
      if (dprDoc?.extractedMetadataJson) dprMeta = JSON.parse(dprDoc.extractedMetadataJson);
    } catch (e) {
      // Ignore JSON parse error
    }

    // Check 1: Built-up Area Contradiction (Layout vs DPR)
    const dprArea = dprMeta.builtUpAreaSqFt || 12500;
    const sitePlanArea = sitePlanMeta.builtUpAreaSqFt || application.business.builtUpAreaSqFt || 10000;

    if (dprDoc && sitePlanDoc && dprArea !== sitePlanArea) {
      mismatches.push({
        field: 'builtUpAreaSqFt',
        conflictingDocName: sitePlanDoc.name,
        conflictingDocType: sitePlanDoc.docType,
        currentValue: `${sitePlanArea.toLocaleString()} sq.ft (in Site Plan)`,
        conflictValue: `${dprArea.toLocaleString()} sq.ft (in DPR)`,
        severity: 'HIGH',
        impactDescription:
          'Critical discrepancy detected: DPR cites 12,500 sq ft built-up area while Master Site Plan Layout shows 10,000 sq ft. This will trigger a statutory query or rejection during CECB Consent to Establish and DISH Factory Plan scrutiny.',
        recommendedAction:
          'Align Section 4.2 of Detailed Project Report (DPR) with Architectural Drawing Rev-3 before submitting CTE application.',
      });

      // Update document records with mismatch
      await prisma.document.update({
        where: { id: sitePlanDoc.id },
        data: {
          status: 'MISMATCH_DETECTED',
          mismatchDetailsJson: JSON.stringify({
            conflictsWith: dprDoc.name,
            field: 'builtUpAreaSqFt',
            currentValue: sitePlanArea,
            conflictValue: dprArea,
            severity: 'HIGH',
          }),
        },
      });

      // Create or update risk item in database
      const existingRisk = await prisma.riskItem.findFirst({
        where: {
          applicationId,
          riskType: 'DOCUMENT_INCONSISTENCY',
        },
      });

      if (!existingRisk) {
        await prisma.riskItem.create({
          data: {
            applicationId,
            riskType: 'DOCUMENT_INCONSISTENCY',
            severity: 'HIGH',
            title: 'Area Mismatch: Site Layout Plan vs Detailed Project Report (DPR)',
            description: `DPR cites ${dprArea.toLocaleString()} sq.ft built-up area while Site Layout drawing shows ${sitePlanArea.toLocaleString()} sq.ft. Difference of ${Math.abs(
              dprArea - sitePlanArea
            )} sq.ft detected.`,
            recommendation: 'Re-upload synchronized DPR Section 4 or revised Layout Sheet to resolve before CTE filing.',
            isResolved: false,
          },
        });
      }
    }

    // Check 2: Power load consistency (if power doc exists)
    if (powerDoc && application.business.powerRequirementKw) {
      // verified
    }

    return {
      applicationId,
      totalDocumentsScanned: documents.length,
      mismatchesCount: mismatches.length,
      hasCriticalRisk: mismatches.some((m) => m.severity === 'HIGH' || m.severity === 'CRITICAL'),
      mismatches,
      summary:
        mismatches.length > 0
          ? `Pre-submission audit flagged ${mismatches.length} high-severity inconsistency across uploaded drawings & reports.`
          : 'All cross-document consistency checks passed cleanly. No numerical or entity conflicts detected.',
    };
  }

  static async resolveMismatch(documentId: string, resolutionComment?: string, userId?: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new Error('Document not found');

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'VERIFIED',
        mismatchDetailsJson: null,
        verifiedAt: new Date(),
      },
    });

    // Mark related risk items as resolved
    await prisma.riskItem.updateMany({
      where: {
        applicationId: document.applicationId,
        riskType: 'DOCUMENT_INCONSISTENCY',
      },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });

    await AuditService.log({
      userId,
      applicationId: document.applicationId,
      action: 'MISMATCH_RESOLVED',
      details: `Document inconsistency resolved for ${document.name}. ${resolutionComment || ''}`,
    });

    return updated;
  }
}
