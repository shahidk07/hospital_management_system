# Development Prompts: Integration

**Owner:** Shahid  
**Purpose:** Final integration, cross-module wiring, and deployment.

---

## Prompt: Project Scaffolding

```
Context: [Paste foundation-prompt.md]

Task: Scaffold the complete project structure.

References:
- Documentation/project-structure-guide.md
- Documentation/database-schema.md

Create:

backend/
├── package.json (express, prisma, bcrypt, jsonwebtoken, cors, dotenv, multer, @google/generative-ai, razorpay, cloudinary)
├── prisma/schema.prisma (from database-schema.md)
├── prisma/seed.ts (admin user, departments, sample doctors)
├── src/app.js
├── src/server.js
├── src/config/ (database, cloudinary, razorpay, gemini)
├── src/middleware/ (auth, rbac, error, validate)
├── src/utils/ (apiResponse, AppError, auditLogger, logger)
└── src/modules/ (empty folders for all 10 modules)

frontend/
├── package.json (react, react-router-dom, axios, tailwindcss, d3)
├── src/api/axios.js
├── src/context/AuthContext.jsx
├── src/routes/AppRoutes.jsx, ProtectedRoute.jsx, RoleRoute.jsx
├── src/components/layout/ (Navbar, Sidebar)
├── src/pages/ (admin/, doctor/, patient/, shared/)

Include:
- .env.example for both backend and frontend
- .gitignore (node_modules, .env, dist)
- Health check endpoint: GET /api/health

Do NOT:
- Implement module logic yet (scaffolding only)
- Suggest alternative frameworks
```

---

## Prompt: Final Integration

```
Context: [Paste foundation-prompt.md]

Task: Integrate all modules and verify end-to-end flows.

Checklist:

1. Auth flow:
   - Register patient → login → access patient dashboard
   - Admin login → create doctor → doctor can login

2. Appointment flow:
   - Patient books appointment → invoice created → doctor notified
   - Patient pays → appointment confirmed → doctor notified
   - Doctor starts consultation → records diagnosis → creates prescription
   - Patient notified of prescription → can view and get AI explanation

3. EMR flow:
   - Doctor uploads lab report → patient notified → patient views/downloads

4. Analytics:
   - Admin dashboard shows correct metrics and D3 charts

5. Audit logs:
   - All 9 event types appear in admin audit log

6. AI:
   - Symptom analyzer works for patient
   - Record summarizer works in consultation
   - Prescription explainer works for patient

Cross-cutting checks:
- CORS configured correctly
- JWT refresh works on token expiry
- RBAC enforced on all protected routes
- Error responses follow standard format
- No secrets in codebase

Fix any integration issues found. Ensure all modules are registered in app.js.
```

---

## Prompt: Deployment to Render

```
Context: [Paste foundation-prompt.md]

Task: Deploy the application to Render.

Reference: Documentation/deployment-guide.md

Steps:
1. Set up Neon PostgreSQL database
2. Run prisma migrate deploy and seed
3. Deploy backend as Render Web Service
4. Deploy frontend as Render Static Site
5. Configure all environment variables
6. Set up Razorpay webhook URL
7. Verify CORS with production URLs
8. Run post-deploy smoke tests

Smoke test script:
- Health check returns 200
- Register + login works
- Book appointment + pay works
- Upload EMR file works
- AI endpoint returns response
- Admin analytics loads
```

---

## Prompt: Seed Data Script

```
Task: Create prisma/seed.ts with initial data.

Include:
1. Admin user:
   - email: admin@hospital.com
   - password: Admin@123 (hashed)
   - role: ADMIN

2. Departments:
   - General Medicine (fee: 500)
   - Cardiology (fee: 1000)
   - Orthopedics (fee: 800)
   - Pediatrics (fee: 600)
   - Dermatology (fee: 700)
   - Neurology (fee: 1200)

3. Three doctors (one per department minimum):
   - Dr. Jane Smith — Cardiology
   - Dr. Robert Kumar — General Medicine
   - Dr. Priya Sharma — Pediatrics

4. Two sample patients (optional):
   - John Doe
   - Sarah Wilson

Use bcrypt for password hashing. Log credentials to console on seed.
```
