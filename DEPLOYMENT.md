# 🚀 NitiPath Deployment Guide (SIH26130)

## 🌐 Deploy to Vercel (Frontend SPA)

NitiPath is fully configured for seamless one-click or Git-connected deployment on [Vercel](https://vercel.com/).

### 1. Vercel Configuration (`vercel.json`)
The repository includes a ready-to-deploy [`vercel.json`](./vercel.json):
- Automatically rewrites all SPA routes (`/dashboard`, `/admin/dashboard`, `/approvals`, etc.) to `/index.html` to eliminate 404 errors on page reloads.
- Sets up high-performance immutable asset caching headers for `/assets/*`.

### 2. Steps to Deploy on Vercel
1. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
2. Import your GitHub repository: `hellogys22/Ntitpath_SIH_2026`.
3. Vercel will automatically detect the **Vite** framework preset:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   Under the **Environment Variables** section, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://your-backend-domain.com/api` | Point to your live backend (e.g., Render, Railway, VPS) |
   
   *(Note: If `VITE_API_URL` is omitted, NitiPath gracefully defaults to its embedded mock demonstration intelligence suite, ensuring zero downtime during hackathon presentations!)*
5. Click **Deploy**. Your site will be live within ~30 seconds!

---

## 💻 Quick Start (Local / VPS)

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

## 🔐 Environment Variables

### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/nitipath?schema=public" # Or file:./dev.db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.vercel.app
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (`.env` or Vercel Settings):
```env
VITE_API_URL=https://your-backend-api-domain.com/api
```

---

## 🔑 Default Demo Credentials
- **Business Portal**: `business@demo.com` / `demo123`
- **Department / Admin**: `admin@demo.com` / `admin123`
