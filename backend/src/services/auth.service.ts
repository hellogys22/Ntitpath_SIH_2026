import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { ENV } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AuthUserPayload } from '../types';
import { AuditService } from './audit.service';

export class AuthService {
  static async register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role || 'BUSINESS_USER',
        department: input.department,
        phone: input.phone,
      },
    });

    await AuditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      details: `User registered with role ${user.role}`,
      ipAddress,
      userAgent,
    });

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      department: user.department,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
      token,
    };
  }

  static async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        businesses: {
          include: {
            applications: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    await AuditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      details: `User logged in from role ${user.role}`,
      ipAddress,
      userAgent,
    });

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      department: user.department,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        phone: user.phone,
        businesses: user.businesses,
      },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        phone: true,
        createdAt: true,
        businesses: {
          include: {
            applications: {
              include: {
                approvals: true,
                riskItems: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async resetDemoData() {
    const demoApp = await prisma.application.findFirst({
      where: { applicationNumber: 'NTP-00128' },
    });
    if (demoApp) {
      await prisma.application.update({
        where: { id: demoApp.id },
        data: {
          status: 'IN_PROGRESS',
          readinessScore: 72,
          riskLevel: 'HIGH',
        },
      });

      await prisma.document.updateMany({
        where: { applicationId: demoApp.id, docType: 'SITE_PLAN' },
        data: {
          status: 'MISMATCH_DETECTED',
          mismatchDetailsJson: JSON.stringify({
            field: 'Total Plant Constructed Area',
            buildingPlanValue: '10,000 sq ft',
            projectDocValue: '12,500 sq ft',
            impactDescription: 'The Pollution Control Board requires exact constructed footprint matching Effluent Treatment Capacity calculations.',
            severity: 'HIGH',
          }),
        },
      });

      await prisma.approval.updateMany({
        where: { applicationId: demoApp.id, approvalCode: 'APPR_POLLUTION_CTE' },
        data: {
          status: 'UNDER_REVIEW',
          queryComment: 'Area discrepancy between site layout and DPR requires rectification.',
        },
      });
    }

    return { message: 'Demo data sandbox reset to initial state' };
  }

  private static generateToken(payload: AuthUserPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });
  }
}
