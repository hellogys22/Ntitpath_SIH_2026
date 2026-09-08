import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { BusinessService } from '../services/business.service';

export class BusinessController {
  static async createBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const business = await BusinessService.createBusiness(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Business profile registered successfully',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBusinesses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const businesses = await BusinessService.getBusinessesByUser(userId);
      res.status(200).json({
        success: true,
        data: businesses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBusinessById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const business = await BusinessService.getBusinessById(id, req.user?.role === 'ADMIN' ? undefined : req.user?.id);
      res.status(200).json({
        success: true,
        data: business,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const businesses = await BusinessService.getBusinessesByUser(userId);
      const profile = businesses.length > 0 ? businesses[0] : null;
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const businesses = await BusinessService.getBusinessesByUser(userId);
      if (businesses.length === 0) {
        const created = await BusinessService.createBusiness(userId, req.body);
        res.status(201).json({
          success: true,
          message: 'Business profile created successfully',
          data: created,
        });
        return;
      }
      const updated = await BusinessService.updateBusiness(businesses[0].id, userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Business profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updated = await BusinessService.updateBusiness(id, userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Business profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
