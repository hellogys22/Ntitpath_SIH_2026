import prisma from '../prisma/client';
import { CreateBusinessInput, UpdateBusinessInput } from '../validators/business.validator';
import { AuditService } from './audit.service';

export class BusinessService {
  static async createBusiness(userId: string, input: CreateBusinessInput) {
    const business = await prisma.business.create({
      data: {
        userId,
        name: input.name,
        entityType: input.entityType,
        pan: input.pan,
        gstin: input.gstin,
        address: input.address,
        city: input.city,
        state: input.state,
        pinCode: input.pinCode,
        sector: input.sector,
        investmentCr: input.investmentCr,
        employees: input.employees,
        landAcres: input.landAcres,
        builtUpAreaSqFt: input.builtUpAreaSqFt || 10000,
        powerRequirementKw: input.powerRequirementKw || 250,
        waterRequirementKld: input.waterRequirementKld || 50,
      },
      include: { applications: true },
    });

    await AuditService.log({
      userId,
      action: 'BUSINESS_CREATED',
      details: `Created business entity: ${business.name} (${business.sector})`,
    });

    return business;
  }

  static async getBusinessesByUser(userId: string) {
    return prisma.business.findMany({
      where: { userId },
      include: {
        applications: {
          include: {
            approvals: true,
            riskItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getBusinessById(businessId: string, userId?: string) {
    const whereClause: any = { id: businessId };
    if (userId) whereClause.userId = userId;

    const business = await prisma.business.findFirst({
      where: whereClause,
      include: {
        applications: {
          include: {
            approvals: true,
            documents: true,
            riskItems: true,
            complianceItems: true,
          },
        },
      },
    });

    if (!business) {
      throw new Error('Business not found or unauthorized access');
    }

    return business;
  }

  static async updateBusiness(businessId: string, userId: string, input: UpdateBusinessInput) {
    const existing = await prisma.business.findFirst({
      where: { id: businessId, userId },
    });

    if (!existing) {
      throw new Error('Business not found or unauthorized');
    }

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: input,
    });

    await AuditService.log({
      userId,
      action: 'BUSINESS_UPDATED',
      details: `Updated business profile for ${updated.name}`,
    });

    return updated;
  }
}
