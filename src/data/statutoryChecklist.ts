import { DocumentItem, Approval, BusinessProfile, RiskItem } from '../types';
import { generateRoadmapAndChecklist } from '../services/rulesEngine';
import { VerificationEngine } from '../services/verificationEngine';

/**
 * Builds the comprehensive statutory documents checklist for a given enterprise profile,
 * ensuring all required documents are populated and grouped under their matched approvals.
 */
export function getComprehensiveDocuments(
  profile: BusinessProfile,
  existingDocs: DocumentItem[] = []
): {
  approvals: Approval[];
  documents: DocumentItem[];
  risks: RiskItem[];
} {
  // Parse numeric values from profile strings if needed
  let investmentNum = 5.0;
  if (profile.investment) {
    const match = profile.investment.match(/[\d.]+/);
    if (match) investmentNum = parseFloat(match[0]);
  }

  let landNum = 5.0;
  if (profile.land) {
    const match = profile.land.match(/[\d.]+/);
    if (match) landNum = parseFloat(match[0]);
  }

  const generated = generateRoadmapAndChecklist({
    companyName: profile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
    industry: profile.industry || 'Food Processing',
    location: profile.location || 'Raipur, Chhattisgarh',
    investmentAmountCr: investmentNum > 0 ? investmentNum : 5.0,
    landAcres: landNum > 0 ? landNum : 5.0,
    employees: profile.employees > 0 ? profile.employees : 50,
    projectType: profile.projectType || 'New Manufacturing Unit',
  });

  if (!generated.success || generated.documents.length === 0) {
    return {
      approvals: generated.approvals,
      documents: existingDocs,
      risks: generated.risks,
    };
  }

  // Pre-seeded document status map (for demo / initial evaluations)
  const preseededMap = new Map<string, Partial<DocumentItem>>();

  // 1. DOC-001: Building Site Plan with area mismatch
  preseededMap.set('DOC-001', {
    status: 'Needs Correction',
    issue: 'Discrepancy detected: Master Site Plan specifies 10,000 sq ft, whereas DPR specifies 12,500 sq ft.',
    action: 'Review & Re-upload layout with corrected dimensions',
    uploadedDate: '02 Sep 2026',
    fileSize: '4.2 MB',
    extractedMetadata: {
      builtUpAreaSqFt: 10000,
      architectReg: 'CA/2018/98421',
      companyName: profile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
    },
    mismatchDetail: {
      field: 'Total Plant Constructed Area',
      buildingPlanValue: '10,000 sq ft',
      projectDocValue: '12,500 sq ft',
      impactDescription: 'The Pollution Control Board requires exact constructed footprint matching Effluent Treatment Capacity calculations.',
    },
  });

  // 2. DOC-002: Land Ownership Registry
  preseededMap.set('DOC-002', {
    status: 'Verified',
    action: 'Verified by Revenue & CSIDC Land Cell',
    uploadedDate: '20 Aug 2026',
    fileSize: '5.4 MB',
    extractedMetadata: {
      khasraNumber: '142/1-B, Urla Industrial Estate',
      landArea: '5.0 Acres',
      companyName: profile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
      validUntil: '2056-08-19',
    },
  });

  // 3. DOC-003: Certificate of Incorporation & GSTIN
  preseededMap.set('DOC-003', {
    status: 'Verified',
    action: 'Verified by RoC & Commercial Tax Dept',
    uploadedDate: '15 Aug 2026',
    fileSize: '2.1 MB',
    extractedMetadata: {
      cin: 'U15400CT2026PTC012345',
      gstin: '22AABCR1234F1Z5',
      companyName: profile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
    },
  });

  // 4. DOC-004: Detailed Project Report (DPR)
  preseededMap.set('DOC-004', {
    status: 'Needs Correction',
    issue: 'DPR built-up area (12,500 sq ft) conflicts with Site Layout Drawing Rev-2 (10,000 sq ft).',
    action: 'Align DPR with Architectural Drawing Rev-3',
    uploadedDate: '04 Sep 2026',
    fileSize: '8.1 MB',
    extractedMetadata: {
      builtUpAreaSqFt: 12500,
      investmentCr: 12.5,
      capacity: '50 MT/Day',
      companyName: profile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
    },
    mismatchDetail: {
      field: 'Total Plant Constructed Area',
      buildingPlanValue: '10,000 sq ft',
      projectDocValue: '12,500 sq ft',
      impactDescription: 'DPR must align with submitted layout drawings to ensure valid environmental and safety reviews.',
    },
  });

  // 5. DOC-005: ETP Process Flowchart
  preseededMap.set('DOC-005', {
    status: 'Verified',
    action: 'Verified by Environmental Engineering Agency',
    uploadedDate: '05 Sep 2026',
    fileSize: '3.6 MB',
    extractedMetadata: {
      etpCapacityKld: 50,
      zldCertified: true,
      companyName: profile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
    },
  });

  // 6. DOC-006: Provisional Water Allocation NOC
  preseededMap.set('DOC-006', {
    status: 'Needs Correction',
    issue: 'Document validity expired on 15 Aug 2026. A current, renewed water sanction is required.',
    action: 'Apply for extension or upload renewed CSIDC allocation',
    uploadedDate: '12 Aug 2026',
    fileSize: '1.9 MB',
    extractedMetadata: {
      allocationKld: 40,
      validUntil: '2026-08-15', // Expired
      sanctionNumber: 'CSIDC/WTR/2026/891',
      companyName: profile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
    },
  });

  // Also check existingDocs passed from state (e.g. user uploaded or modified)
  const existingMap = new Map<string, DocumentItem>();
  for (const doc of existingDocs) {
    existingMap.set(doc.id, doc);
    existingMap.set(doc.name.toLowerCase().trim(), doc);
  }

  // Merge generated documents with preseeded & existing documents
  const mergedDocuments: DocumentItem[] = generated.documents.map((genDoc, idx) => {
    // Check if doc exists in state by id or name
    const existing = existingMap.get(genDoc.id) || existingMap.get(genDoc.name.toLowerCase().trim());
    if (existing) {
      return {
        ...genDoc,
        ...existing,
        approvalId: genDoc.approvalId,
        approvalName: genDoc.approvalName,
        issuingAuthority: genDoc.issuingAuthority,
        acquisitionDifficulty: genDoc.acquisitionDifficulty,
      };
    }

    // Check if matching in preseeded map (first 6 documents)
    const preseed = preseededMap.get(genDoc.id);
    if (preseed) {
      const merged: DocumentItem = {
        ...genDoc,
        ...preseed,
        status: (preseed.status as any) || genDoc.status,
      };
      // Run deterministic verification
      const verification = VerificationEngine.verifyDocument(merged, profile, generated.documents);
      merged.ruleChecks = verification.ruleChecks;
      merged.status = verification.status;
      return merged;
    }

    // Default un-uploaded required document
    return {
      ...genDoc,
      status: 'Not Uploaded',
      action: `Obtain from ${genDoc.issuingAuthority} and upload`,
      ruleChecks: [],
    };
  });

  return {
    approvals: generated.approvals,
    documents: mergedDocuments,
    risks: generated.risks,
  };
}
