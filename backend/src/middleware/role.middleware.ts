import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';

export const requireRoles = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: User is not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of roles: [${roles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRoles(['ADMIN']);
export const requireDepartmentOrAdmin = requireRoles(['ADMIN', 'DEPARTMENT_OFFICER']);
