import { Request } from 'express';

export type UserRole = 'BUSINESS_USER' | 'ADMIN' | 'DEPARTMENT_OFFICER';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApprovalRuleDefinition {
  approvalCode: string;
  name: string;
  department: string;
  category: 'Land' | 'Environment' | 'Safety' | 'Power' | 'Municipal' | 'Operating' | 'Water';
  stage: number;
  slaDays: number;
  expectedDays: number;
  parallelGroupId?: string;
  isCriticalPath: boolean;
  requiredDocuments: string[];
  dependencies: string[];
  condition?: (params: {
    sector: string;
    investmentCr: number;
    employees: number;
    landAcres: number;
    powerRequirementKw?: number;
    waterRequirementKld?: number;
    pollutionCategory?: string;
  }) => boolean;
}

export interface DependencyGraphNode {
  code: string;
  name: string;
  department: string;
  stage: number;
  slaDays: number;
  isCriticalPath: boolean;
  status: string;
  dependencies: string[];
  parallelGroup?: string;
}

export interface ConsistencyMismatch {
  field: string;
  conflictingDocName: string;
  conflictingDocType: string;
  currentValue: string | number;
  conflictValue: string | number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactDescription: string;
  recommendedAction: string;
}
