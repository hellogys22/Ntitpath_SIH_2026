import { BusinessProfile, Approval, DocumentItem, RiskItem, User } from '../types';

export const demoBusinessProfile: BusinessProfile = {
  companyName: "Raipur Fresh Foods Pvt. Ltd.",
  industry: "Food Processing",
  location: "Raipur, Chhattisgarh",
  investment: "₹12.5 Cr",
  employees: 50,
  land: "4.5 Acres (Urla Industrial Area, Raipur)",
  projectType: "New Manufacturing Unit",
  readinessScore: 72,
  contactEmail: "business@demo.com",
  contactMobile: "+91 98765 43210"
};

export const demoApprovals: Approval[] = [
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
    name: "Land Use Conversion Certificate (NA)",
    department: "Revenue & Land Records Department",
    status: "Completed",
    risk: "LOW",
    dependency: "None",
    nextAction: "Completed - Certificate Granted",
    dueStage: "Site Acquisition",
    whyItMatters: "Converts agricultural land status to industrial non-agricultural use.",
    description: "Revenue clearance for industrial manufacturing activities on 4.5 acres in Urla Industrial Area.",
    isCriticalPath: false,
    canBeParallel: false
  },
  {
    id: "APP-003",
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
    id: "APP-004",
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
    id: "APP-005",
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
    id: "APP-006",
    name: "Industrial Water Supply Connection",
    department: "CSIDC / Water Resources Department",
    status: "Pending",
    risk: "MEDIUM",
    dependency: "None (Independent)",
    nextAction: "Renew provisional allocation / submit water NOC before 45-day deadline",
    dueStage: "Pre-Operations",
    whyItMatters: "Essential process water supply line allocation for food washing and sanitization.",
    description: "Pipeline connectivity approval and daily volumetric allocation.",
    isCriticalPath: false,
    canBeParallel: true
  }
];

export const demoDocuments: DocumentItem[] = [
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
    name: "Land Ownership Registry & Khasra Copy",
    requirement: "Required",
    status: "Verified",
    action: "Verified by Revenue Dept",
    approvalId: "APP-002",
    approvalName: "Land Use Conversion Certificate (NA)",
    uploadedDate: "20 Aug 2026",
    fileSize: "5.4 MB"
  },
  {
    id: "DOC-003",
    name: "Certificate of Incorporation & GSTIN Registration",
    requirement: "Required",
    status: "Verified",
    action: "Verified by ROC & Commercial Tax Dept",
    approvalId: "APP-003",
    approvalName: "GST Registration",
    uploadedDate: "15 Aug 2026",
    fileSize: "2.1 MB"
  },
  {
    id: "DOC-004",
    name: "Detailed Project Report (DPR) & Production Flow",
    requirement: "Required",
    status: "Under Review",
    issue: "Submitted on 04 Sep 2026, awaiting departmental verification",
    action: "Track verification status",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    uploadedDate: "04 Sep 2026",
    fileSize: "8.1 MB"
  },
  {
    id: "DOC-005",
    name: "Effluent Treatment Plant (ETP) Process Flowchart",
    requirement: "Required",
    status: "Under Review",
    issue: "Uploaded. Technical review in progress.",
    action: "Track verification status",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    uploadedDate: "01 Sep 2026",
    fileSize: "6.0 MB"
  },
  {
    id: "DOC-006",
    name: "Provisional Water Allocation NOC & Consumption Scheme",
    requirement: "Required",
    status: "Under Review",
    issue: "Provisional NOC active — requires statutory renewal within 45 days",
    action: "File renewal submission before expiry",
    approvalId: "APP-006",
    approvalName: "Industrial Water Supply Connection",
    uploadedDate: "25 Aug 2026",
    fileSize: "3.2 MB"
  },
  {
    id: "DOC-007",
    name: "Fire Hydrant & Evacuation Schematic Diagram",
    requirement: "Required",
    status: "Under Review",
    issue: "Hydrant schematic submitted, inspection pending",
    action: "Await site survey",
    approvalId: "APP-004",
    approvalName: "Fire Safety NOC",
    uploadedDate: "28 Aug 2026",
    fileSize: "3.5 MB"
  }
];

export const demoRisks: RiskItem[] = [
  {
    id: "RISK-001",
    approvalId: "APP-001",
    approvalName: "Pollution Consent to Establish (CTE)",
    riskLevel: "HIGH",
    reason: "Discrepancy in plant constructed area (10,000 sq ft in layout plan vs 12,500 sq ft in DPR)",
    dependency: "Document Verification Stage",
    recommendedAction: "Correct area dimensions across drawings or align DPR statement to prevent CTE rejection.",
    category: "Document Inconsistency"
  },
  {
    id: "RISK-002",
    approvalId: "APP-006",
    approvalName: "Industrial Water Supply Connection",
    riskLevel: "MEDIUM",
    reason: "Water NOC provisional validity expires in 45 days; requires intake survey completion.",
    dependency: "Water Allocation Department",
    recommendedAction: "Submit permanent allocation application before 45-day provisional expiry window closes.",
    category: "Regulatory Expiry"
  }
];

export const demoUser: User = {
  id: "DEMO-USER-001",
  email: "business@demo.com",
  name: "Rajesh Sharma (Demo User)",
  role: "business",
  companyName: "Raipur Fresh Foods Pvt. Ltd."
};
