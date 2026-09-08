import { 
  BusinessProfile, 
  Approval, 
  DocumentItem, 
  RiskItem, 
  SupportScheme, 
  ComplianceEvent, 
  AdminApplication, 
  DepartmentWorkload,
  NotificationItem
} from '../types';

export const initialBusinessProfile: BusinessProfile = {
  companyName: "Raipur Fresh Foods Pvt. Ltd.",
  industry: "Food Processing",
  location: "Raipur, Chhattisgarh",
  investment: "₹5 Crore",
  employees: 50,
  land: "5 Acres",
  projectType: "New Manufacturing Unit",
  readinessScore: 72,
  contactEmail: "business@demo.com",
  contactMobile: "+91 98765 43210"
};

export const initialApprovals: Approval[] = [
  {
    id: "APP-001",
    name: "Pollution Consent to Establish (CTE)",
    department: "Environment & Pollution Control Board",
    status: "In Progress",
    risk: "HIGH",
    dependency: "Document Verification",
    nextAction: "Resolve production capacity & area mismatch",
    dueStage: "Initial Setup / Civil Work",
    whyItMatters: "Mandatory statutory clearance prior to initiating any industrial construction or equipment installation on site.",
    description: "Evaluates effluent treatment capacity, emission standards, and site boundary compliance for food processing activities.",
    isCriticalPath: true,
    canBeParallel: false
  },
  {
    id: "APP-002",
    name: "Factory Plan & Structural Approval",
    department: "Directorate of Industrial Safety & Health",
    status: "In Progress",
    risk: "MEDIUM",
    dependency: "Site Layout Plan",
    nextAction: "Review structural safety certificate",
    dueStage: "Civil Construction",
    whyItMatters: "Ensures worker safety compliance, exit route adequacy, and machinery layout standards.",
    description: "Approval of architectural drawings, emergency exits, ventilation, and machinery spacing.",
    isCriticalPath: true,
    canBeParallel: false
  },
  {
    id: "APP-003",
    name: "Fire Safety NOC",
    department: "State Fire & Emergency Services",
    status: "Pending",
    risk: "LOW",
    dependency: "None (Independent)",
    nextAction: "Prepare hydrant and sprinkler design documents",
    dueStage: "Pre-Operations",
    whyItMatters: "Crucial for industrial safety clearance and insurance validation before operation.",
    description: "Verification of fire fighting systems, water storage tanks, and emergency evacuation drills.",
    isCriticalPath: false,
    canBeParallel: true
  },
  {
    id: "APP-004",
    name: "Electricity HT Substation Connection",
    department: "State Power Distribution Corporation",
    status: "Pending",
    risk: "LOW",
    dependency: "None (Independent)",
    nextAction: "Submit high-tension transformer load estimate",
    dueStage: "Pre-Operations",
    whyItMatters: "Required for high-voltage industrial power feed and processing machinery.",
    description: "Grid feasibility study, transformer installation permission, and meter allocation.",
    isCriticalPath: false,
    canBeParallel: true
  },
  {
    id: "APP-005",
    name: "Industrial Water Supply Connection",
    department: "Municipal Corporation / CSIDC Water Division",
    status: "Pending",
    risk: "LOW",
    dependency: "None (Independent)",
    nextAction: "Submit daily water consumption estimate",
    dueStage: "Pre-Operations",
    whyItMatters: "Essential process water supply line allocation for food washing and sanitization.",
    description: "Pipeline connectivity approval and daily volumetric allocation.",
    isCriticalPath: false,
    canBeParallel: true
  },
  {
    id: "APP-006",
    name: "Land Use Conversion Certificate (NA)",
    department: "Revenue & Land Records Department",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - Certificate Granted",
    dueStage: "Site Acquisition",
    whyItMatters: "Converts agricultural land status to industrial non-agricultural use.",
    description: "Revenue clearance for industrial manufacturing activities on 5 acres.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-007",
    name: "Boiler Safety Inspection & Registration",
    department: "Chief Inspectorate of Boilers",
    status: "In Progress",
    risk: "HIGH",
    dependency: "Technical Design Drawings",
    nextAction: "Upload boiler manufacturer pressure test certificate",
    dueStage: "Equipment Erection",
    whyItMatters: "Mandatory for steam processing and thermal sterilization units in food processing.",
    description: "Pressure vessel safety inspection and operational pressure rating certification.",
    isCriticalPath: true,
    canBeParallel: false
  },
  {
    id: "APP-008",
    name: "Labour & BOCW Registration",
    department: "Department of Labour",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - Registration Issued",
    dueStage: "Civil Construction",
    whyItMatters: "Ensures compliance with construction workers welfare and minimum wage laws.",
    description: "Employer registration under Shops & Establishments and BOCW Act.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-009",
    name: "FSSAI Manufacturing Central License",
    department: "Food Safety and Standards Authority of India",
    status: "In Progress",
    risk: "MEDIUM",
    dependency: "Water Quality Lab Report",
    nextAction: "Submit NABL laboratory test results for process water",
    dueStage: "Pre-Commissioning",
    whyItMatters: "Core regulatory license mandatory for food processing and packaging operations.",
    description: "Sanitation audit, food handler medical records, and food safety management system check.",
    isCriticalPath: true,
    canBeParallel: false
  },
  {
    id: "APP-010",
    name: "Municipal Trade License",
    department: "Raipur Municipal Corporation",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - License Issued",
    dueStage: "Business Setup",
    whyItMatters: "Local civic body authorization to conduct commercial processing within municipal jurisdiction.",
    description: "Trade license and solid waste disposal plan approval.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-011",
    name: "GST Registration",
    department: "Commercial Tax Department",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - GSTIN Active",
    dueStage: "Business Setup",
    whyItMatters: "Tax identity for inter-state trading and input tax credit claims.",
    description: "Goods and Services Tax Identification Number (GSTIN) registration.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-012",
    name: "Import Export Code (IEC)",
    department: "Directorate General of Foreign Trade (DGFT)",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - IEC Issued",
    dueStage: "Business Setup",
    whyItMatters: "Enables export of processed food products to international markets.",
    description: "10-digit IEC code for customs clearance and trade incentives.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-013",
    name: "Pollution Consent to Operate (CTO)",
    department: "Environment & Pollution Control Board",
    status: "Pending",
    risk: "LOW",
    dependency: "CTE Approval & ETP Erection",
    nextAction: "Await completion of CTE clearance",
    dueStage: "Final Operations",
    whyItMatters: "Final clearance before commercial production commences.",
    description: "Verification of installed effluent treatment plant (ETP) against CTE parameters.",
    isCriticalPath: true,
    canBeParallel: false
  },
  {
    id: "APP-014",
    name: "Final Factory Operating License",
    department: "Directorate of Industrial Safety & Health",
    status: "Pending",
    risk: "LOW",
    dependency: "CTO & Building Inspection",
    nextAction: "Await CTO clearance",
    dueStage: "Final Operations",
    whyItMatters: "Official permit to operate machinery with workforce on site.",
    description: "Final site audit and machinery trial run inspection.",
    isCriticalPath: true,
    canBeParallel: false
  },
  {
    id: "APP-015",
    name: "Legal Metrology Package Stamping",
    department: "Department of Legal Metrology",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - Certificate Issued",
    dueStage: "Packaging Setup",
    whyItMatters: "Regulates net weight declarations on food retail packaging.",
    description: "Verification of automated weigh-fill machines and label compliance.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-016",
    name: "Industrial LPG / Energy Storage Clearance",
    department: "Petroleum and Explosives Safety Organization (PESO)",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - Storage Permitted",
    dueStage: "Civil Construction",
    whyItMatters: "Safe installation clearance for bulk gas cylinders and boiler fuel tanks.",
    description: "Safety distance clearance and pressure relief system audit.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-017",
    name: "Solid Waste Management Clearance",
    department: "Urban Development & Sanitation Division",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - Waste Contract Active",
    dueStage: "Pre-Operations",
    whyItMatters: "Mandatory organic waste treatment and composting setup.",
    description: "MoU for organic waste processing and municipal tipping agreement.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-018",
    name: "Groundwater Extraction NOC",
    department: "Central Ground Water Authority (CGWA)",
    status: "In Progress",
    risk: "MEDIUM",
    dependency: "Hydro-geological Assessment",
    nextAction: "Submit rainwater harvesting recharge structure plan",
    dueStage: "Pre-Operations",
    whyItMatters: "Required for industrial borewell groundwater abstraction in Chhattisgarh.",
    description: "Impact assessment on local aquifer and recharge pit design review.",
    isCriticalPath: false,
    canBeParallel: true
  }
];

export const initialDocuments: DocumentItem[] = [
  {
    id: "DOC-001",
    name: "Approved Building Site Plan & Layout",
    requirement: "Required",
    status: "Needs Correction",
    issue: "Area mismatch between layout drawing (10,000 sq ft) and DPR submission (12,500 sq ft)",
    action: "Review & Re-upload layout with corrected dimensions",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    uploadedDate: "02 Sep 2026",
    fileSize: "4.2 MB",
    mismatchDetail: {
      field: "Total Plant Constructed Area",
      buildingPlanValue: "10,000 sq ft",
      projectDocValue: "12,500 sq ft",
      impactDescription: "The Pollution Control Board requires exact constructed footprint matching Effluent Treatment Capacity calculations."
    }
  },
  {
    id: "DOC-002",
    name: "Detailed Project Report (DPR) & Production Capacity",
    requirement: "Required",
    status: "Needs Correction",
    issue: "Daily output capacity in DPR (50 Metric Tons/Day) conflicts with ETP sizing certificate (35 MT/Day)",
    action: "Align DPR capacity figures with environmental engineering certificates",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    uploadedDate: "04 Sep 2026",
    fileSize: "8.1 MB",
    mismatchDetail: {
      field: "Daily Peak Output Capacity",
      buildingPlanValue: "35 MT / Day (ETP Rating)",
      projectDocValue: "50 MT / Day (DPR Statement)",
      impactDescription: "Mismatched capacity ratings will result in rejection of Pollution CTE application during technical committee review."
    }
  },
  {
    id: "DOC-003",
    name: "Environmental Compliance Self-Declaration",
    requirement: "Required",
    status: "Missing",
    issue: "Form 1-A Environmental Impact Self-Declaration has not been uploaded",
    action: "Download template, sign, and upload PDF",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    approvalNameText: "Pollution Consent to Establish (CTE)"
  } as any,
  {
    id: "DOC-004",
    name: "Boiler Manufacturer Pressure Test Certificate",
    requirement: "Required",
    status: "Needs Correction",
    issue: "Stamp missing on hydrostatic test certificate",
    action: "Request stamped certificate from boiler supplier",
    approvalId: "APP-007",
    approvalName: "Boiler Safety Inspection",
    uploadedDate: "05 Sep 2026",
    fileSize: "2.8 MB"
  },
  {
    id: "DOC-005",
    name: "NABL Water Analysis & Quality Test Report",
    requirement: "Required",
    status: "Under Review",
    issue: "Submitted on 07 Sep 2026, awaiting departmental verification",
    action: "Track verification status",
    approvalId: "APP-009",
    approvalName: "FSSAI Central License",
    uploadedDate: "07 Sep 2026",
    fileSize: "1.9 MB"
  },
  {
    id: "DOC-006",
    name: "Land Ownership Registry & Khasra Copy",
    requirement: "Required",
    status: "Verified",
    action: "Verified by Revenue Dept",
    approvalId: "APP-006",
    approvalName: "Land Use Conversion",
    uploadedDate: "20 Aug 2026",
    fileSize: "5.4 MB"
  },
  {
    id: "DOC-007",
    name: "Industrial Power Demand Load Sheet",
    requirement: "Required",
    status: "Verified",
    action: "Verified by Electrical Inspectorate",
    approvalId: "APP-004",
    approvalName: "Electricity Connection",
    uploadedDate: "25 Aug 2026",
    fileSize: "1.2 MB"
  },
  {
    id: "DOC-008",
    name: "Fire Hydrant System Schematic Diagram",
    requirement: "Required",
    status: "Verified",
    action: "Verified by Fire Department",
    approvalId: "APP-003",
    approvalName: "Fire Safety NOC",
    uploadedDate: "28 Aug 2026",
    fileSize: "3.5 MB"
  },
  {
    id: "DOC-009",
    name: "Effluent Treatment Plant (ETP) Process Flowchart",
    requirement: "Required",
    status: "Verified",
    action: "Verified by Environmental Engineer",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    uploadedDate: "01 Sep 2026",
    fileSize: "6.0 MB"
  },
  {
    id: "DOC-010",
    name: "Certificate of Incorporation & Memorandum of Association",
    requirement: "Required",
    status: "Verified",
    action: "Verified by ROC",
    approvalId: "APP-011",
    approvalName: "GST Registration",
    uploadedDate: "15 Aug 2026",
    fileSize: "2.1 MB"
  }
];

export const initialRisks: RiskItem[] = [
  {
    id: "RISK-001",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    riskLevel: "HIGH",
    reason: "Discrepancy in plant constructed area (10,000 sq ft vs 12,500 sq ft) and missing Form 1-A declaration",
    dependency: "Document Verification Stage",
    recommendedAction: "Correct capacity statements across DPR/Building Plan and upload missing Form 1-A declaration immediately.",
    category: "Document Inconsistency"
  },
  {
    id: "RISK-002",
    approvalId: "APP-007",
    approvalName: "Boiler Safety Inspection & Registration",
    riskLevel: "HIGH",
    reason: "Hydrostatic test stamp missing from boiler OEM certificate; technical review blocked.",
    dependency: "OEM Certification Clearance",
    recommendedAction: "Re-upload OEM stamped hydrostatic pressure test certificate.",
    category: "Technical Review"
  },
  {
    id: "RISK-003",
    approvalId: "APP-002",
    approvalName: "Factory Plan & Structural Approval",
    riskLevel: "MEDIUM",
    reason: "Structural safety certificate pending third-party chartered engineer signoff.",
    dependency: "Architectural Drawing Sanction",
    recommendedAction: "Obtain signoff from empaneled structural engineer in Chhattisgarh.",
    category: "Inter-Department Lock"
  },
  {
    id: "RISK-004",
    approvalId: "APP-009",
    approvalName: "FSSAI Manufacturing Central License",
    riskLevel: "MEDIUM",
    reason: "Process water NABL testing report under review; microbial count limits pending validation.",
    dependency: "Water Test Verification",
    recommendedAction: "Monitor lab portal status for report authentication.",
    category: "Technical Review"
  },
  {
    id: "RISK-005",
    approvalId: "APP-018",
    approvalName: "Groundwater Extraction NOC",
    riskLevel: "MEDIUM",
    reason: "CGWA artificial recharge pit design requires local municipal drainage connection proof.",
    dependency: "Municipal Drainage Clearance",
    recommendedAction: "Attach municipal stormwater drainage line map.",
    category: "Inter-Department Lock"
  }
];

export const initialSupportSchemes: SupportScheme[] = [
  {
    id: "SCH-001",
    title: "PM Formalisation of Micro Food Processing Enterprises (PMFME)",
    sector: "Food Processing Industry",
    location: "Chhattisgarh & Pan-India",
    businessStage: "New Manufacturing Unit",
    description: "Provides credit-linked capital subsidy for establishing new food processing units or upgrading technology.",
    matchingFactors: ["Food Processing Industry", "New Unit", "Capital Investment ₹5 Crore"],
    eligibilityNote: "Eligible for 35% credit-linked capital subsidy (up to ₹10 Lakhs) + interest subvention under State Food Processing Policy.",
    estimatedBenefit: "Up to ₹10 Lakhs Capital Grant + 3% Interest Subvention"
  },
  {
    id: "SCH-002",
    title: "Chhattisgarh Industrial Policy 2024-29 — Capital Investment Subsidy",
    sector: "All Manufacturing / Food Processing Focus",
    location: "Raipur, Chhattisgarh",
    businessStage: "New Unit Setup",
    description: "State government incentive package offering land rebate, electricity duty exemption, and capital subsidy for Category-B industrial blocks.",
    matchingFactors: ["Location: Raipur", "Investment: ₹5 Crore", "Employment: 50 Workers"],
    eligibilityNote: "Qualifies for 40% Fixed Capital Investment (FCI) subsidy spread over 5 years + 100% Electricity Duty Exemption for 7 years.",
    estimatedBenefit: "₹2.0 Crore Subsidy over 5 years + 100% Power Duty Exemption"
  },
  {
    id: "SCH-003",
    title: "PLI Scheme for Food Processing Industry (PLISFPI)",
    sector: "Food Processing (Ready to Cook/Eat)",
    location: "Pan-India",
    businessStage: "Commercial Expansion",
    description: "Performance-linked incentive to support creation of global food manufacturing champions and off-farm employment.",
    matchingFactors: ["Sector: Food Processing", "Minimum Investment threshold met"],
    eligibilityNote: "Supports sales growth incentives (4% to 10% on incremental sales) upon reaching commercial production.",
    estimatedBenefit: "4% - 10% Incentive on Incremental Turnover"
  }
];

export const initialComplianceEvents: ComplianceEvent[] = [
  {
    id: "COMP-001",
    title: "Pollution Control Annual Emission Return Submission",
    type: "Recurring",
    dueDate: "15 Oct 2026",
    department: "Environment Board",
    status: "Upcoming",
    priority: "High"
  },
  {
    id: "COMP-002",
    title: "Factory Annual Fire Safety Equipment Inspection",
    type: "Inspection",
    dueDate: "22 Oct 2026",
    department: "Fire Services",
    status: "Upcoming",
    priority: "High"
  },
  {
    id: "COMP-003",
    title: "Quarterly Labour Welfare Fund Returns",
    type: "Recurring",
    dueDate: "30 Oct 2026",
    department: "Labour Department",
    status: "Upcoming",
    priority: "Medium"
  },
  {
    id: "COMP-004",
    title: "FSSAI Annual Hygiene & Safety Audit",
    type: "Inspection",
    dueDate: "15 Nov 2026",
    department: "FSSAI",
    status: "Upcoming",
    priority: "Medium"
  },
  {
    id: "COMP-005",
    title: "Boiler Safety Certificate Renewal",
    type: "Renewal",
    dueDate: "05 Jan 2027",
    department: "Boilers Inspectorate",
    status: "Upcoming",
    priority: "Low"
  }
];

export const initialAdminApplications: AdminApplication[] = [
  {
    id: "NTP-00128",
    businessName: "Raipur Fresh Foods Pvt. Ltd.",
    industry: "Food Processing",
    location: "Raipur, Chhattisgarh",
    stage: "Document Verification",
    risk: "HIGH",
    status: "Needs Attention",
    lastUpdated: "Today, 10:45 AM",
    approvalsTotal: 18,
    approvalsCompleted: 8,
    approvalsInProgress: 5,
    docsTotal: 27,
    docsAccepted: 24,
    docsNeedCorrection: 2,
    docsMissing: 1,
    hasMismatch: true,
    buildingPlanArea: "10,000 sq ft",
    projectDocArea: "12,500 sq ft",
    reviewNotes: ["Discrepancy noted in Constructed Area between Architectural Layout and DPR. Officer flagged for applicant clarification on 06 Sep 2026."],
    departmentInCharge: "Pollution Control Board"
  },
  {
    id: "NTP-00129",
    businessName: "Shakti Heavy Engineering Ltd.",
    industry: "Metallurgical & Fabrication",
    location: "Bhilai, Chhattisgarh",
    stage: "Technical Inspection",
    risk: "MEDIUM",
    status: "In Review",
    lastUpdated: "Yesterday, 04:15 PM",
    approvalsTotal: 22,
    approvalsCompleted: 14,
    approvalsInProgress: 6,
    docsTotal: 31,
    docsAccepted: 29,
    docsNeedCorrection: 2,
    docsMissing: 0,
    hasMismatch: false,
    buildingPlanArea: "45,000 sq ft",
    projectDocArea: "45,000 sq ft",
    reviewNotes: ["High tension power load allocation pending transformer testing report."],
    departmentInCharge: "Industries Department"
  },
  {
    id: "NTP-00130",
    businessName: "Bharat Agro Cold Storage Industries",
    industry: "Cold Chain & Logistics",
    location: "Durg, Chhattisgarh",
    stage: "Inter-Department Clearance",
    risk: "HIGH",
    status: "Needs Attention",
    lastUpdated: "05 Sep 2026",
    approvalsTotal: 15,
    approvalsCompleted: 6,
    approvalsInProgress: 7,
    docsTotal: 20,
    docsAccepted: 17,
    docsNeedCorrection: 1,
    docsMissing: 2,
    hasMismatch: true,
    buildingPlanArea: "18,000 sq ft",
    projectDocArea: "22,000 sq ft",
    reviewNotes: ["NHAI highway access NOC pending verification by Public Works Department."],
    departmentInCharge: "Environment Board"
  },
  {
    id: "NTP-00131",
    businessName: "Mahamaya Pharma Synthetics",
    industry: "Pharmaceutical Formulations",
    location: "Raigarh, Chhattisgarh",
    stage: "Final CTO Review",
    risk: "LOW",
    status: "In Review",
    lastUpdated: "04 Sep 2026",
    approvalsTotal: 24,
    approvalsCompleted: 21,
    approvalsInProgress: 3,
    docsTotal: 38,
    docsAccepted: 38,
    docsNeedCorrection: 0,
    docsMissing: 0,
    hasMismatch: false,
    buildingPlanArea: "30,000 sq ft",
    projectDocArea: "30,000 sq ft",
    reviewNotes: ["Final Zero Liquid Discharge (ZLD) plant inspection completed successfully."],
    departmentInCharge: "Pollution Control Board"
  },
  {
    id: "NTP-00132",
    businessName: "Chhattisgarh Renewable Solar Park",
    industry: "Green Energy Generation",
    location: "Rajnandgaon, Chhattisgarh",
    stage: "Land Records Audit",
    risk: "MEDIUM",
    status: "In Review",
    lastUpdated: "03 Sep 2026",
    approvalsTotal: 12,
    approvalsCompleted: 9,
    approvalsInProgress: 3,
    docsTotal: 16,
    docsAccepted: 15,
    docsNeedCorrection: 1,
    docsMissing: 0,
    hasMismatch: false,
    buildingPlanArea: "120 Acres",
    projectDocArea: "120 Acres",
    reviewNotes: ["High voltage grid evacuation line alignment under survey."],
    departmentInCharge: "Power Distribution Corp"
  }
];

export const initialDepartmentWorkloads: DepartmentWorkload[] = [
  {
    department: "Environment & Pollution Control Board",
    activeApplications: 184,
    pendingReviews: 31,
    highRisk: 14,
    bottlenecks: 8
  },
  {
    department: "Directorate of Industrial Safety & Health",
    activeApplications: 142,
    pendingReviews: 24,
    highRisk: 9,
    bottlenecks: 6
  },
  {
    department: "State Fire & Emergency Services",
    activeApplications: 96,
    pendingReviews: 12,
    highRisk: 4,
    bottlenecks: 3
  },
  {
    department: "State Power Distribution Corporation",
    activeApplications: 118,
    pendingReviews: 17,
    highRisk: 6,
    bottlenecks: 5
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "NOTIF-001",
    title: "High-risk approval requires attention",
    message: "Pollution Consent to Establish requires production capacity & area document correction.",
    time: "10 mins ago",
    type: "risk",
    link: "/documents",
    read: false,
    recipientRole: "business"
  },
  {
    id: "NOTIF-002",
    title: "Document mismatch detected",
    message: "Building Plan (10,000 sq ft) and Project Report (12,500 sq ft) contain different area values.",
    time: "1 hour ago",
    type: "document",
    link: "/documents",
    read: false,
    recipientRole: "business"
  },
  {
    id: "NOTIF-003",
    title: "Compliance deadline approaching",
    message: "Fire Safety annual equipment inspection scheduled for 22 Oct 2026.",
    time: "1 day ago",
    type: "compliance",
    link: "/compliance",
    read: true,
    recipientRole: "business"
  },
  {
    id: "NOTIF-004",
    title: "14 applications require document review",
    message: "Environment Board queue has 14 high-risk applications pending technical clearance.",
    time: "30 mins ago",
    type: "approval",
    link: "/admin/applications",
    read: false,
    recipientRole: "admin"
  }
];
