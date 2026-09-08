import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'nitipath_super_secret_jwt_key_sih2024_2026_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173',
  CORS_ORIGIN: (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(','),
};
