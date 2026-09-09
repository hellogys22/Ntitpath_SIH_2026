import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security and CORS middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl or Postman)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Note: Confidential uploads are private and accessible only via RLS-scoped /api/documents/:id/download or signed URLs.
// Public static directory disabled for security hardening.

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
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
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
