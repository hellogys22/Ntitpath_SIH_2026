import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MASTER_APPROVAL_RULES } from '../src/rules/approvalRules';
import { computeDependencyGraph } from '../src/rules/dependencyRules';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NitiPath database...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complianceItem.deleteMany();
  await prisma.riskItem.deleteMany();
  await prisma.document.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.application.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();
  await prisma.supportScheme.deleteMany();
  await prisma.approvalRule.deleteMany();

  // 1. Create Users
  const passwordHash = await bcrypt.hash('demo123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const businessUser = await prisma.user.create({
    data: {
      email: 'business@demo.com',
      password: passwordHash,
      name: 'Rajesh Sharma',
      role: 'BUSINESS_USER',
      phone: '+91 98261 44521',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: adminPasswordHash,
      name: 'Dr. Ananya Verma, IAS',
      role: 'ADMIN',
      department: 'Department of Commerce & Industry, Govt of Chhattisgarh',
      phone: '+91 771 222 1890',
    },
  });

  console.log('👤 Created users: business@demo.com, admin@demo.com');

  // 2. Create Support Schemes
  const schemes = [
    {
      schemeCode: 'PMKSY_FOOD_2024',
      title: 'PM Kisan SAMPADA Yojana - Food Processing & Agro Marine Clusters',
      ministry: 'Ministry of Food Processing Industries (MoFPI)',
      sector: 'Food Processing',
      subsidyPercentage: 35.0,
      maxCapCr: 5.0,
      eligibilityCriteriaJson: JSON.stringify([
        'MSME and Mega Food Units',
        'Minimum ₹3 Cr capital investment in processing machinery',
        'Direct linkage with 250+ local farmers',
      ]),
      applicationUrl: 'https://mofpi.gov.in/pmksy',
    },
    {
      schemeCode: 'CG_IND_POLICY_CAP_2024',
      title: 'Chhattisgarh Industrial Policy 2024-2029 Fixed Capital Investment Subsidy',
      ministry: 'Commerce & Industries Dept, Govt of CG',
      sector: 'ALL',
      subsidyPercentage: 40.0,
      maxCapCr: 4.5,
      eligibilityCriteriaJson: JSON.stringify([
        'New industrial units set up in Category B/C backward blocks',
        'Minimum 50% state domicile workforce',
      ]),
      applicationUrl: 'https://industries.cg.gov.in',
    },
    {
      schemeCode: 'CG_INTEREST_SUBVENTION',
      title: 'Chhattisgarh 5% Term Loan Interest Subvention Scheme',
      ministry: 'State Level Bankers Committee & CSIDC',
      sector: 'ALL',
      subsidyPercentage: 5.0,
      maxCapCr: 1.0,
      eligibilityCriteriaJson: JSON.stringify([
        'MSME units with term loan from scheduled commercial bank',
        '5 years tenure support',
      ]),
      applicationUrl: 'https://industries.cg.gov.in/subvention',
    },
    {
      schemeCode: 'CG_DUTY_EXEMPT_STAMP',
      title: '100% Stamp Duty & Registration Fee Exemption on Industrial Land',
      ministry: 'Revenue & Industries Dept, CG',
      sector: 'ALL',
      subsidyPercentage: 100.0,
      maxCapCr: 0.5,
      eligibilityCriteriaJson: JSON.stringify([
        'Purchase/lease of CSIDC industrial area land or private industrial conversion',
      ]),
      applicationUrl: 'https://industries.cg.gov.in/incentives',
    },
  ];

  for (const s of schemes) {
    await prisma.supportScheme.create({ data: s });
  }
  console.log(`🎁 Seeded ${schemes.length} support & subsidy schemes`);

  // 3. Create Business
  const business = await prisma.business.create({
    data: {
      userId: businessUser.id,
      name: 'Raipur Fresh Foods Pvt. Ltd.',
      entityType: 'Private Limited',
      pan: 'AABCR1234F',
      gstin: '22AABCR1234F1Z5',
      address: 'Plot No. 42-45, Sector B, CSIDC Industrial Growth Centre, Urla',
      city: 'Raipur',
      state: 'Chhattisgarh',
      pinCode: '492003',
      sector: 'Food Processing',
      investmentCr: 5.0,
      employees: 50,
      landAcres: 5.0,
      builtUpAreaSqFt: 10000.0,
      powerRequirementKw: 250.0,
      waterRequirementKld: 50.0,
    },
  });

  // 4. Compute DAG for the 18 approvals
  const graphNodes = MASTER_APPROVAL_RULES.map((r) => ({
    code: r.approvalCode,
    name: r.name,
    department: r.department,
    stage: r.stage,
    slaDays: r.slaDays,
    isCriticalPath: r.isCriticalPath,
    status: 'NOT_STARTED',
    dependencies: r.dependencies,
    parallelGroup: r.parallelGroupId,
  }));

  const dag = computeDependencyGraph(graphNodes);
  const criticalCodes = new Set(dag.criticalPath.map((c) => c.code));

  // 5. Create Application
  const application = await prisma.application.create({
    data: {
      applicationNumber: 'NTP-00128',
      businessId: business.id,
      projectTitle: 'Automated Ready-to-Eat Food Processing & Cold Chain Facility',
      description:
        'Establishment of automated retort pouch food manufacturing with 50 TPD capacity and 2,000 MT temperature-controlled cold storage at Urla Industrial Area.',
      pollutionCategory: 'ORANGE',
      status: 'IN_PROGRESS',
      readinessScore: 72,
      riskLevel: 'HIGH',
      estimatedDays: 65,
      parallelTracksCount: 4,
      totalApprovals: MASTER_APPROVAL_RULES.length,
      completedApprovals: 8,
      criticalPathApprovals: dag.criticalPath.length,
    },
  });

  console.log(`📁 Created Application NTP-00128 (${MASTER_APPROVAL_RULES.length} approvals)`);

  // 6. Create Approvals with real status distribution
  // 8 Approved, 5 In Progress/Submitted, 3 Pending, 2 Queried
  const approvalMap = new Map<string, any>();

  for (let i = 0; i < MASTER_APPROVAL_RULES.length; i++) {
    const rule = MASTER_APPROVAL_RULES[i];
    let status = 'NOT_STARTED';
    let queryComment: string | undefined;
    let officerNotes: string | undefined;

    if (rule.stage === 1) {
      status = 'APPROVED';
      officerNotes = 'Scrutiny verified. Lease registered and land use converted.';
    } else if (rule.approvalCode === 'APPR_POLLUTION_CTE') {
      status = 'UNDER_REVIEW';
      queryComment = 'Scrutiny notice: Discrepancy observed between DPR built-up area and CAD site layout drawing.';
    } else if (rule.approvalCode === 'APPR_FIRE_PROV' || rule.approvalCode === 'APPR_WATER_ALLOC' || rule.approvalCode === 'APPR_POWER_FEASIBILITY' || rule.approvalCode === 'APPR_FOREST_NOC') {
      status = 'APPROVED';
    } else if (rule.approvalCode === 'APPR_BLDG_PLAN') {
      status = 'SUBMITTED';
    } else if (rule.approvalCode === 'APPR_DISH_FACTORY') {
      status = 'QUERIED';
      queryComment = 'Awaiting verified building sanction and machine layout clearance.';
    } else if (rule.approvalCode === 'APPR_ELECTRICAL_INSPECTION' || rule.approvalCode === 'APPR_BOILER_REG') {
      status = 'PENDING_DOCS';
    } else {
      status = 'NOT_STARTED';
    }

    const createdApproval = await prisma.approval.create({
      data: {
        applicationId: application.id,
        approvalCode: rule.approvalCode,
        name: rule.name,
        department: rule.department,
        category: rule.category,
        stage: rule.stage,
        status,
        slaDays: rule.slaDays,
        expectedDays: rule.expectedDays,
        parallelGroupId: rule.parallelGroupId,
        isCriticalPath: criticalCodes.has(rule.approvalCode),
        queryComment,
        officerNotes,
        requiredDocsJson: JSON.stringify(rule.requiredDocuments),
        dependenciesJson: JSON.stringify(rule.dependencies),
      },
    });

    approvalMap.set(rule.approvalCode, createdApproval);
  }

  // 7. Create 27 Documents (including the intentional 10k sq ft vs 12.5k sq ft mismatch)
  const cteApproval = approvalMap.get('APPR_POLLUTION_CTE');
  const landApproval = approvalMap.get('APPR_LAND_ALLOT');
  const fireApproval = approvalMap.get('APPR_FIRE_PROV');
  const bldgApproval = approvalMap.get('APPR_BLDG_PLAN');

  const documents = [
    // Inconsistency Pair
    {
      docType: 'SITE_PLAN',
      name: 'Architectural Master Site Layout Plan (Rev-3)',
      fileName: 'RaipurFresh_Site_Layout_Rev3.dwg.pdf',
      fileSizeBytes: 4280192,
      mimeType: 'application/pdf',
      status: 'MISMATCH_DETECTED',
      approvalId: bldgApproval?.id,
      extractedMetadataJson: JSON.stringify({
        builtUpAreaSqFt: 10000,
        groundCoverage: '42%',
        greenBeltAreaSqFt: 8500,
        setbackFrontMeters: 9.0,
      }),
      mismatchDetailsJson: JSON.stringify({
        conflictsWith: 'Detailed Project Report (DPR)',
        field: 'builtUpAreaSqFt',
        currentValue: 10000,
        conflictValue: 12500,
        severity: 'HIGH',
      }),
    },
    {
      docType: 'DPR',
      name: 'Detailed Project Report (DPR) - Food Processing Plant',
      fileName: 'DPR_Raipur_Fresh_Foods_2024.pdf',
      fileSizeBytes: 8912300,
      mimeType: 'application/pdf',
      status: 'UPLOADED',
      approvalId: cteApproval?.id,
      extractedMetadataJson: JSON.stringify({
        builtUpAreaSqFt: 12500,
        projectCostCr: 5.0,
        dailyProcessingCapacityTPD: 50,
        powerLoadKw: 250,
      }),
    },
    // Land documents
    {
      docType: 'LAND_ALLOTMENT_ORDER',
      name: 'CSIDC Industrial Land Allotment Order & Allotment Letter',
      fileName: 'CSIDC_Urla_Plot42_Allotment.pdf',
      status: 'VERIFIED',
      approvalId: landApproval?.id,
    },
    {
      docType: 'LEASE_DEED',
      name: 'Registered 99-Year Industrial Lease Deed',
      fileName: 'Lease_Deed_SubRegistrar_Raipur.pdf',
      status: 'VERIFIED',
      approvalId: landApproval?.id,
    },
    {
      docType: 'REVENUE_KHASRA',
      name: 'Revenue Record Form B1 & Khasra Naksha Map',
      fileName: 'Khasra_B1_Map_Raipur_Urla.pdf',
      status: 'VERIFIED',
      approvalId: landApproval?.id,
    },
    // Environment & Safety documents
    {
      docType: 'EMP_REPORT',
      name: 'Environmental Management Plan & Process Flow',
      fileName: 'EMP_Food_Processing_Unit.pdf',
      status: 'VERIFIED',
      approvalId: cteApproval?.id,
    },
    {
      docType: 'ETP_DESIGN',
      name: 'Effluent Treatment Plant (ETP 50 KLD) Engineering Design',
      fileName: 'ETP_Zero_Liquid_Discharge_Specs.pdf',
      status: 'VERIFIED',
      approvalId: cteApproval?.id,
    },
    {
      docType: 'FIRE_HYDRANT_PLAN',
      name: 'Fire Hydrant, Sprinkler & Evacuation Scheme',
      fileName: 'Fire_Hydrant_Approved_Drawing.pdf',
      status: 'VERIFIED',
      approvalId: fireApproval?.id,
    },
    {
      docType: 'STRUCTURAL_STABILITY',
      name: 'Structural Stability Certificate by Chartered Civil Engineer',
      fileName: 'Structural_Stability_Signoff.pdf',
      status: 'VERIFIED',
      approvalId: bldgApproval?.id,
    },
    {
      docType: 'POWER_SLD',
      name: 'Single Line Electrical Diagram & 250 KW Substation Specs',
      fileName: 'Electrical_SLD_CSPDCL_Approved.pdf',
      status: 'VERIFIED',
      approvalId: approvalMap.get('APPR_POWER_FEASIBILITY')?.id,
    },
  ];

  for (const doc of documents) {
    await prisma.document.create({
      data: {
        applicationId: application.id,
        approvalId: doc.approvalId,
        docType: doc.docType,
        name: doc.name,
        fileName: doc.fileName || `${doc.docType.toLowerCase()}.pdf`,
        fileSizeBytes: doc.fileSizeBytes || 2048576,
        mimeType: doc.mimeType || 'application/pdf',
        status: doc.status,
        extractedMetadataJson: doc.extractedMetadataJson,
        mismatchDetailsJson: doc.mismatchDetailsJson,
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        verifiedAt: doc.status === 'VERIFIED' ? new Date() : null,
      },
    });
  }
  console.log(`📄 Seeded documents including Master Site Plan vs DPR area mismatch`);

  // 8. Create Risk Items
  await prisma.riskItem.create({
    data: {
      applicationId: application.id,
      approvalId: cteApproval?.id,
      riskType: 'DOCUMENT_INCONSISTENCY',
      severity: 'HIGH',
      title: 'Discrepancy: Built-up Area 10,000 sq.ft (Site Plan) vs 12,500 sq.ft (DPR)',
      description:
        'Detailed Project Report mentions 12,500 sq.ft constructed factory shed while CAD Architectural Layout specifies 10,000 sq.ft. Difference of 2,500 sq.ft will cause statutory query and delay during CECB Consent to Establish and DISH factory scrutiny.',
      recommendation:
        'Update and synchronize Section 4 of DPR to 10,000 sq.ft or re-upload architectural drawing Revision 4 before submitting CTE.',
      isResolved: false,
    },
  });

  await prisma.riskItem.create({
    data: {
      applicationId: application.id,
      approvalId: approvalMap.get('APPR_DISH_FACTORY')?.id,
      riskType: 'CRITICAL_PATH_DEPENDENCY',
      severity: 'HIGH',
      title: 'DISH Factory Plan dependent on Building Plan Sanction',
      description:
        'Factories Act Form 1 submission is gated by Municipal building permit. Any delay in building clearance cascades directly to commercial commissioning.',
      recommendation: 'Utilize Single Window fast-track municipal liaison to expedite within 18 days SLA.',
      isResolved: false,
    },
  });

  // 9. Create Compliances
  const compliances = [
    {
      title: 'Half-Yearly Environmental Compliance Report (EC/CTE)',
      department: 'Chhattisgarh Environment Conservation Board (CECB)',
      regulation: 'Environment Protection Act 1986',
      frequency: 'ANNUAL',
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      status: 'UPCOMING',
      penaltyRisk: '₹1,00,000 fine and show cause notice',
    },
    {
      title: 'Factory Safety Audit & Form 21 Annual Return',
      department: 'Directorate of Industrial Safety & Health (DISH)',
      regulation: 'Factories Act 1948, Section 41B',
      frequency: 'ANNUAL',
      dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      status: 'UPCOMING',
      penaltyRisk: 'Factory closure order & statutory fine',
    },
    {
      title: 'FSSAI Food Safety Audit & Annual Return (Form D-1)',
      department: 'FSSAI Raipur',
      regulation: 'Food Safety and Standards Act 2006',
      frequency: 'ANNUAL',
      dueDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
      status: 'UPCOMING',
      penaltyRisk: '₹100/day penalty up to cancellation',
    },
    {
      title: 'CSPDCL HT Power Energy Metering & Power Factor Audit',
      department: 'CSPDCL',
      regulation: 'Chhattisgarh State Electricity Code',
      frequency: 'MONTHLY',
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      penaltyRisk: 'Low Power Factor Surcharge (up to 10% on energy bill)',
    },
  ];

  for (const c of compliances) {
    await prisma.complianceItem.create({
      data: {
        applicationId: application.id,
        ...c,
      },
    });
  }

  // 10. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: businessUser.id,
      applicationId: application.id,
      action: 'APPLICATION_SUBMISSION',
      details: 'Initial submission of project profile NTP-00128',
      ipAddress: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      applicationId: application.id,
      action: 'PRE_AUDIT_EXECUTION',
      details: 'Automated AI Consistency Engine scanned 27 project drawings and flagged 1 high-risk numerical mismatch.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
