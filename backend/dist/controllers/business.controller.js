"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessController = void 0;
const business_service_1 = require("../services/business.service");
class BusinessController {
    static async createBusiness(req, res, next) {
        try {
            const userId = req.user.id;
            const business = await business_service_1.BusinessService.createBusiness(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Business profile registered successfully',
                data: business,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyBusinesses(req, res, next) {
        try {
            const userId = req.user.id;
            const businesses = await business_service_1.BusinessService.getBusinessesByUser(userId);
            res.status(200).json({
                success: true,
                data: businesses,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getBusinessById(req, res, next) {
        try {
            const { id } = req.params;
            const business = await business_service_1.BusinessService.getBusinessById(id, req.user?.role === 'ADMIN' ? undefined : req.user?.id);
            res.status(200).json({
                success: true,
                data: business,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const businesses = await business_service_1.BusinessService.getBusinessesByUser(userId);
            const profile = businesses.length > 0 ? businesses[0] : null;
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const businesses = await business_service_1.BusinessService.getBusinessesByUser(userId);
            if (businesses.length === 0) {
                const created = await business_service_1.BusinessService.createBusiness(userId, req.body);
                res.status(201).json({
                    success: true,
                    message: 'Business profile created successfully',
                    data: created,
                });
                return;
            }
            const updated = await business_service_1.BusinessService.updateBusiness(businesses[0].id, userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Business profile updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateBusiness(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updated = await business_service_1.BusinessService.updateBusiness(id, userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Business profile updated successfully',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BusinessController = BusinessController;
