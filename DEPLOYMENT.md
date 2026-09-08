# 🚀 NitiPath Deployment Guide (SIH26130)

## Quick Start (Local / VPS)

### Option 1: Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API Docs: `http://localhost:5000/api/docs`

---

### Option 2: Standard Node.js Setup

#### 1. Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run build
npm start
```

#### 2. Frontend:
```bash
npm install
npm run build
npm run preview   # Or deploy dist/ to Vercel/Netlify/Nginx
```

---

## Environment Variables

### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/nitipath?schema=public" # Or file:./dev.db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (`.env`):
```env
VITE_API_URL=https://your-backend-api-domain.com/api
```

---

## Default Demo Credentials
- **Business Portal**: `business@demo.com` / `demo123`
- **Department / Admin**: `admin@demo.com` / `admin123`
