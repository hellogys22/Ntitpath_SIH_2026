"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const copilot_controller_1 = require("../controllers/copilot.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJwt);
router.post('/query', copilot_controller_1.CopilotController.query);
exports.default = router;
