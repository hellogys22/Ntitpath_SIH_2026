"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.register(req.body, req.ip, req.headers['user-agent']);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.login(req.body, req.ip, req.headers['user-agent']);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const user = await auth_service_1.AuthService.getMe(req.user.id);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
