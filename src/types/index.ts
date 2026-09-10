export type UserRole = 'business' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  companyName?: string;
}

export interface BusinessProfile {
  companyName: string;
  industry: string;
  location: string;
  investment: string;
  employees: number;
  land: string;
  projectType: string;
  readinessScore: number;
  contactEmail: string;
  contactMobile: string;
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ApprovalStatus = 'In Progress' | 'Completed' | 'Pending' | 'Blocked';

export interface Approval {
  id: string;
  name: string;
  department: string;
  status: ApprovalStatus;
  risk: RiskLevel;
  dependency: string;
  nextAction: string;
  dueStage: string;
  whyItMatters: string;
  description: string;
  isCriticalPath?: boolean;
  canBeParallel?: boolean;
}

export type DocumentStatus = 'Verified' | 'Needs Correction' | 'Not Uploaded' | 'Missing' | 'Under Review';

export type RuleCheckCategory = 'REQUIRED_FIELDS' | 'ENTITY_MATCH' | 'VALIDITY_DATE' | 'CROSS_DOCUMENT_CONSISTENCY';

export interface RuleCheckResult {
  ruleId: string;
  category: RuleCheckCategory;
  title: string;
  passed: boolean;
  message: string;
  remediation: string;
  expectedValue?: string;
  foundValue?: string;
}

export interface DocumentVersionItem {
  versionNumber: number;
  fileName: string;
  fileSizeBytes?: number;
  uploadedAt: string;
  status: DocumentStatus;
  ruleChecks?: RuleCheckResult[];
  fileUrl?: string;
}

export interface DocumentMismatch {
  field: string;
  buildingPlanValue: string;
  projectDocValue: string;
  impactDescription: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileName?: string;
  docType?: string;
  requirement: 'Required' | 'Optional';
  status: DocumentStatus;
  issue?: string;
  action: string;
  approvalId: string;
  approvalName: string;
  uploadedDate?: string;
  fileSize?: string;
  fileUrl?: string;
  mismatchDetail?: DocumentMismatch;
  issuingAuthority?: string;
  acquisitionDifficulty?: 'Easy' | 'Moderate' | 'Difficult' | 'High';
  ruleChecks?: RuleCheckResult[];
  versions?: DocumentVersionItem[];
  currentVersion?: number;
  extractedMetadata?: Record<string, any>;
}

export interface RiskItem {
  id: string;
  approvalId: string;
  approvalName: string;
  riskLevel: RiskLevel;
  reason: string;
  dependency: string;
  recommendedAction: string;
  category: 'Document Inconsistency' | 'Inter-Department Lock' | 'Regulatory Expiry' | 'Technical Review';
}

export interface SupportScheme {
  id: string;
  title: string;
  sector: string;
  location: string;
  businessStage: string;
  description: string;
  matchingFactors: string[];
  eligibilityNote: string;
  estimatedBenefit: string;
}

export interface ComplianceEvent {
  id: string;
  title: string;
  type: 'Renewal' | 'Inspection' | 'Recurring' | 'Expiry';
  dueDate: string;
  department: string;
  status: 'Upcoming' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
}

export interface AdminApplication {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  stage: string;
  risk: RiskLevel;
  status: 'Needs Attention' | 'In Review' | 'Completed';
  lastUpdated: string;
  approvalsTotal: number;
  approvalsCompleted: number;
  approvalsInProgress: number;
  docsTotal: number;
  docsAccepted: number;
  docsNeedCorrection: number;
  docsMissing: number;
  hasMismatch: boolean;
  buildingPlanArea: string;
  projectDocArea: string;
  reviewNotes: string[];
  departmentInCharge: string;
}

export interface DepartmentWorkload {
  department: string;
  activeApplications: number;
  pendingReviews: number;
  highRisk: number;
  bottlenecks: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'risk' | 'document' | 'compliance' | 'approval';
  link: string;
  read: boolean;
  recipientRole: UserRole;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  basedOn?: string[];
  actionLink?: string;
  actionText?: string;
}
