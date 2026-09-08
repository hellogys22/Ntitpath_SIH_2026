"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Security and CORS middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl or Postman)
        if (!origin)
            return callback(null, true);
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static uploads serving
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Swagger API Documentation
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customSiteTitle: 'NitiPath Intelligence API Docs',
}));
// Root health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'UP',
        platform: 'NitiPath Industrial Approval & Compliance Intelligence',
        sihProblemStatement: 'SIH26130',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api', routes_1.default);
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
