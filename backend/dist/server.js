"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const client_1 = __importDefault(require("./prisma/client"));
const PORT = env_1.ENV.PORT || 5000;
async function startServer() {
    try {
        await client_1.default.$connect();
        console.log('✅ Database connected successfully via Prisma');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 NitiPath Intelligence Backend running on port ${PORT}`);
            console.log(`📑 Swagger Documentation available at http://localhost:${PORT}/api/docs`);
            console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start NitiPath backend server:', error);
        process.exit(1);
    }
}
startServer();
