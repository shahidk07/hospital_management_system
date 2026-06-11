# Deployment Guide

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Owner:** Shahid

---

## Architecture Overview

```
┌─────────────────┐
│  React Frontend │  → Render (Static Site)
│  Tailwind + D3  │
└────────┬────────┘
         │ HTTPS
┌────────▼────────┐
│  Express API    │  → Render (Web Service)
│  Node.js        │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
 PostgreSQL  Gemini   Razorpay  Cloudinary
  (Neon)     API                 (CDN)
```

---

## Prerequisites

- GitHub repository with project code
- [Render](https://render.com) account
- [Neon](https://neon.tech) PostgreSQL database
- [Cloudinary](https://cloudinary.com) account
- [Razorpay](https://razorpay.com) test account
- Google AI Studio API key (Gemini)

---

## 1. Database Setup (Neon)

1. Create a new project on Neon
2. Create a database named `hospital_db`
3. Copy the connection string (pooled connection recommended)
4. Format: `postgresql://user:password@host/hospital_db?sslmode=require`

### Run Migrations

```bash
cd backend
DATABASE_URL="your-neon-url" npx prisma migrate deploy
DATABASE_URL="your-neon-url" npx prisma db seed
```

---

## 2. Backend Deployment (Render)

### Create Web Service

1. Connect GitHub repository
2. Root directory: `backend`
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm start`
5. Instance type: Free or Starter

### Environment Variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string |
| `JWT_ACCESS_SECRET` | Random 64-char string |
| `JWT_REFRESH_SECRET` | Random 64-char string |
| `JWT_ACCESS_EXPIRY` | `15m` |
| `JWT_REFRESH_EXPIRY` | `7d` |
| `GEMINI_API_KEY` | Google AI Studio key |
| `RAZORPAY_KEY_ID` | Razorpay test key |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `FRONTEND_URL` | Frontend Render URL |

### Health Check

Add endpoint `GET /api/health`:

```json
{ "status": "ok", "timestamp": "2026-06-10T12:00:00Z" }
```

Configure Render health check path: `/api/health`

---

## 3. Frontend Deployment (Render)

### Create Static Site

1. Connect GitHub repository
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`

### Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay test key (public) |

### SPA Routing

Add `_redirects` file in `frontend/public/`:

```
/*    /index.html   200
```

---

## 4. External Service Configuration

### Razorpay Webhook

1. In Razorpay Dashboard → Webhooks
2. URL: `https://your-backend.onrender.com/api/billing/payments/webhook`
3. Events: `payment.captured`, `payment.failed`
4. Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET` env var

### Cloudinary

1. Create upload preset (unsigned or signed)
2. Allowed formats: pdf, jpg, jpeg, png, dcm
3. Max file size: 10MB

### Gemini API

1. Get API key from [Google AI Studio](https://aistudio.google.com)
2. Model: `gemini-1.5-flash` (cost-effective for portfolio)

---

## 5. CORS Configuration

Backend `app.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## 6. Deployment Checklist

### Pre-Deploy

- [ ] All environment variables documented in `.env.example`
- [ ] Prisma migrations tested locally
- [ ] Seed data script works
- [ ] CORS configured for production URL
- [ ] No secrets in codebase

### Post-Deploy

- [ ] Health check returns 200
- [ ] Patient registration works
- [ ] Login returns JWT
- [ ] Appointment booking flow works
- [ ] Razorpay test payment succeeds
- [ ] File upload to Cloudinary works
- [ ] AI endpoints return responses
- [ ] Admin can view audit logs
- [ ] Analytics dashboard loads

---

## 7. Local Development

### Backend

```bash
cd backend
cp .env.example .env
# Fill in .env values
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection timeout | Use Neon pooled connection string |
| CORS errors | Verify `FRONTEND_URL` matches exact frontend URL |
| JWT expired immediately | Check server timezone; verify expiry env vars |
| Razorpay webhook fails | Verify signature secret; check webhook URL is HTTPS |
| Cloudinary upload fails | Check API credentials; verify file size limits |
| Render cold start slow | Free tier spins down after inactivity; first request may take 30s |
| Prisma client not found | Ensure `npx prisma generate` runs in build step |

---

## 9. Environment Separation

| Environment | Database | Razorpay | Purpose |
|-------------|----------|----------|---------|
| Development | Local/Neon dev branch | Test mode | Local dev |
| Production | Neon main branch | Test mode* | Deployed demo |

*Razorpay remains in test mode for portfolio project.

---

## 10. Monitoring (Optional)

For portfolio scope, basic monitoring is sufficient:

- Render dashboard for service health
- Neon dashboard for database metrics
- Manual smoke testing after deploys

No additional monitoring tools (Datadog, Sentry) required unless explicitly added later.
