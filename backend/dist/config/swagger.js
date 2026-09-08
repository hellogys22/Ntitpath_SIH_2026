"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NitiPath Intelligence Backend API (SIH26130)',
            version: '1.0.0',
            description: 'REST APIs for NitiPath Industrial Approval & Compliance Intelligence Platform. Built for SIH26130 with PREDICT → PREVENT → OPTIMIZE → TRACK capabilities.',
            contact: {
                name: 'NitiPath Engineering Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/app.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
