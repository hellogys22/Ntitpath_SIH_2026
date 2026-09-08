"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotController = void 0;
const copilot_service_1 = require("../services/copilot.service");
class CopilotController {
    static async query(req, res, next) {
        try {
            const { applicationId, question } = req.body;
            if (!applicationId || !question) {
                res.status(400).json({ success: false, message: 'applicationId and question are required' });
                return;
            }
            const answer = await copilot_service_1.CopilotService.query(applicationId, question);
            res.status(200).json({
                success: true,
                data: answer,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CopilotController = CopilotController;
