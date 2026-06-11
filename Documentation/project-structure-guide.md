# Project Structure Guide

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Owner:** Shahid

This document defines the canonical folder structure for frontend and backend. All team members must follow this layout.

---

## Repository Root

```
hospital_management_system/
├── README.md
├── Documentation/
│   ├── SRS.md
│   ├── database-schema.md
│   ├── api-contracts.md
│   ├── feature-specs/
│   └── prompts/
├── backend/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── middleware/
│       ├── utils/
│       └── modules/
└── frontend/
    ├── package.json
    ├── public/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── api/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── routes/
        └── utils/
```

---

## Backend Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Must match database-schema.md
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app.js                 # Express app setup, middleware registration
│   ├── server.js              # Server entry point
│   ├── config/
│   │   ├── database.js        # Prisma client singleton
│   │   ├── cloudinary.js
│   │   ├── razorpay.js
│   │   └── gemini.js
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── rbac.middleware.js       # Role authorization
│   │   ├── error.middleware.js      # Global error handler
│   │   └── validate.middleware.js   # Request validation
│   ├── utils/
│   │   ├── apiResponse.js     # Standard response helpers
│   │   ├── AppError.js
│   │   └── logger.js
│   └── modules/
│       ├── auth/
│       ├── patients/
│       ├── appointments/
│       ├── consultations/
│       ├── emr/
│       ├── billing/
│       ├── analytics/
│       ├── notifications/
│       ├── audit-logs/
│       └── ai/
```

---

## Module Internal Structure

Each backend module follows the same pattern:

```
modules/<module-name>/
├── <module>.routes.js         # Express router, middleware chain
├── <module>.controller.js     # Request/response handling
├── <module>.service.js        # Business logic, Prisma calls
└── <module>.validation.js     # Input validation schemas (optional)
```

### Example: `auth/`

```
modules/auth/
├── auth.routes.js
├── auth.controller.js
├── auth.service.js
└── auth.validation.js
```

### Rules

- **Routes** — define endpoints, attach middleware, delegate to controller
- **Controllers** — parse request, call service, format response
- **Services** — all database and external API logic
- No business logic in routes or controllers
- No direct Prisma calls from controllers

---

## Frontend Structure

```
frontend/src/
├── main.jsx                   # React entry
├── App.jsx                    # Root component, providers
├── api/
│   ├── axios.js               # Axios instance with interceptors
│   ├── auth.api.js
│   ├── patients.api.js
│   ├── appointments.api.js
│   ├── consultations.api.js
│   ├── emr.api.js
│   ├── billing.api.js
│   ├── analytics.api.js
│   ├── notifications.api.js
│   └── ai.api.js
├── components/
│   ├── common/                # Button, Modal, Table, Spinner, etc.
│   ├── layout/                # Navbar, Sidebar, Footer
│   ├── auth/
│   ├── patients/
│   ├── appointments/
│   ├── consultations/
│   ├── emr/
│   ├── billing/
│   ├── analytics/
│   ├── notifications/
│   └── ai/
├── context/
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useNotifications.js
├── pages/
│   ├── admin/
│   ├── doctor/
│   ├── patient/
│   └── shared/                # Login, Register, NotFound
├── routes/
│   ├── AppRoutes.jsx
│   ├── ProtectedRoute.jsx
│   └── RoleRoute.jsx
└── utils/
    ├── constants.js
    ├── formatters.js
    └── validators.js
```

---

## Role-Based Page Organization

| Role | Pages Directory |
|------|-----------------|
| Admin | `pages/admin/` — Dashboard, Analytics, AuditLogs, ManageDoctors, ManagePatients |
| Doctor | `pages/doctor/` — Dashboard, Consultations, Patients, EMR |
| Patient | `pages/patient/` — Dashboard, Appointments, Prescriptions, Records, AI Tools |

---

## Environment Files

### Backend `.env`

```
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GEMINI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=
```

**Never commit `.env` files.** Provide `.env.example` instead.

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files (backend) | kebab-case or dot notation | `auth.service.js` |
| Files (frontend) | PascalCase for components | `AppointmentCard.jsx` |
| API routes | kebab-case, plural nouns | `/api/appointments` |
| Database tables | snake_case (Prisma `@@map`) | `patient_profiles` |
| Environment vars | SCREAMING_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| React components | PascalCase | `PatientDashboard` |
| Functions | camelCase | `createAppointment` |
| Constants | SCREAMING_SNAKE_CASE | `APPOINTMENT_STATUS` |

---

## Route Registration (Backend)

In `app.js`, register modules in this order:

```javascript
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/ai', aiRoutes);
```

---

## Import Rules

- Use relative imports within a module
- Shared utilities imported from `utils/` and `middleware/`
- No cross-module service imports (call via HTTP or shared utils only)
- Prisma client imported from `config/database.js` only

---

## Git Branch Strategy

```
main          → production-ready
develop       → integration branch
feature/<module>-<description>  → per-module work
```

Examples:

- `feature/auth-jwt-setup`
- `feature/appointments-booking`
- `feature/emr-upload`

---

## File Creation Checklist

When adding a new backend module:

1. Create folder under `modules/`
2. Add routes, controller, service files
3. Register routes in `app.js`
4. Add API functions in `frontend/src/api/`
5. Update `api-contracts.md`
6. Update feature spec in `feature-specs/`
