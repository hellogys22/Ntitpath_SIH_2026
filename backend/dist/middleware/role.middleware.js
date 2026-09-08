"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDepartmentOrAdmin = exports.requireAdmin = exports.requireRoles = void 0;
const requireRoles = (roles) => {
    return (req, res, next) => {
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
exports.requireRoles = requireRoles;
exports.requireAdmin = (0, exports.requireRoles)(['ADMIN']);
exports.requireDepartmentOrAdmin = (0, exports.requireRoles)(['ADMIN', 'DEPARTMENT_OFFICER']);
