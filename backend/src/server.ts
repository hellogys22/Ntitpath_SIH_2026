import app from './app';
import { ENV } from './config/env';
import prisma from './prisma/client';

const PORT = ENV.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully via Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 NitiPath Intelligence Backend running on port ${PORT}`);
      console.log(`📑 Swagger Documentation available at http://localhost:${PORT}/api/docs`);
      console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start NitiPath backend server:', error);
    process.exit(1);
  }
}

startServer();
