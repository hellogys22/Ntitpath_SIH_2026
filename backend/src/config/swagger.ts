import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NitiPath Intelligence Backend API (SIH26130)',
      version: '1.0.0',
      description:
        'REST APIs for NitiPath Industrial Approval & Compliance Intelligence Platform. Built for SIH26130 with PREDICT → PREVENT → OPTIMIZE → TRACK capabilities.',
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

export const swaggerSpec = swaggerJsdoc(options);
