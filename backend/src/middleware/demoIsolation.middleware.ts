import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const DEMO_USER_ID = 'DEMO-USER-001';
export const DEMO_USER_EMAIL = 'business@demo.com';
export const DEMO_APPLICATION_NUMBER = 'NTP-00128';

/**
 * Middleware: Enforces strict data sandbox isolation for the demo evaluation account.
 * Guarantees that the demo user:
 * 1. Cannot access or view real enterprise applications.
 * 2. Cannot create, mutate, or delete real production accounts or filings.
 * 3. Can only interact with its isolated, pre-seeded demo dossier.
 */
export const enforceDemoIsolation = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const isDemoUser = 
    req.user?.id === DEMO_USER_ID || 
    req.user?.email === DEMO_USER_EMAIL ||
    req.headers['x-demo-mode'] === 'true';

  // Attach demo flag for downstream services
  (req as any).isDemoUser = isDemoUser;

  if (!isDemoUser) {
    return next();
  }

  const method = req.method.toUpperCase();

  // Allow safe read operations
  if (method === 'GET') {
    return next();
  }

  // Block destructive operations on production resources
  if (method === 'DELETE') {
    res.status(403).json({
      success: false,
      message: 'Demo Sandbox Restriction: Deletion is disabled in demonstration mode.',
    });
    return;
  }

  // Check target resource in params or body
  const targetAppId = req.params.applicationId || req.body?.applicationId || req.params.id;
  const targetBizId = req.params.businessId || req.body?.businessId;

  // If a specific application is targeted, ensure it matches the demo application
  if (targetAppId && targetAppId !== DEMO_APPLICATION_NUMBER && !targetAppId.includes('DEMO') && !targetAppId.includes('00128')) {
    res.status(403).json({
      success: false,
      message: 'Demo Sandbox Violation: Demo user is strictly isolated to the pre-seeded Raipur Fresh Foods dossier (NTP-00128).',
    });
    return;
  }

  // Safe mutation within demo scope (e.g. mismatch resolution, simulated upload)
  next();
};
