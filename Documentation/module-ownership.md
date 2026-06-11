# Module Ownership

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Status:** Frozen

This document defines module ownership, responsibilities, and collaboration rules. Ownership is frozen and must not be changed without explicit team agreement.

---

## Team Overview

| Member | Role | Contribution |
|--------|------|--------------|
| Shahid | Technical Lead | 55% |
| Member 2 | Clinical Operations | 22.5% |
| Member 3 | Patient Operations | 22.5% |

---

## Module Ownership Matrix

| Module | Path | Owner | Support |
|--------|------|-------|---------|
| Authentication & RBAC | `backend/src/modules/auth/` | Shahid | — |
| AI Module | `backend/src/modules/ai/` | Shahid | — |
| Audit Logs | `backend/src/modules/audit-logs/` | Shahid | — |
| Analytics (Backend) | `backend/src/modules/analytics/` | Shahid | Member 3 (UI) |
| Patients | `backend/src/modules/patients/` | Member 3 | — |
| Appointments | `backend/src/modules/appointments/` | Member 3 | — |
| Billing & Payments | `backend/src/modules/billing/` | Member 3 | Shahid (Razorpay) |
| Notifications | `backend/src/modules/notifications/` | Member 3 | — |
| Consultations | `backend/src/modules/consultations/` | Member 2 | — |
| EMR | `backend/src/modules/emr/` | Member 2 | Shahid (Cloudinary) |

---

## Shahid — Technical Lead (55%)

### Responsibilities

- Documentation and system architecture
- Database design (PostgreSQL + Prisma)
- Authentication, JWT, refresh tokens, RBAC
- AI module (Gemini integration)
- Audit logs
- Analytics backend
- Razorpay integration
- Cloudinary integration (cross-cutting)
- Deployment (Render + Neon)
- GitHub management and final integration
- Code reviews
- API standards and contracts

### Owned Modules

```
auth/
ai/
audit-logs/
analytics/   (backend only)
```

### Cross-Cutting Ownership

- JWT and refresh token strategy
- Database relationships and migrations
- API response format standards
- Environment variable conventions
- Prisma schema (final approval)

---

## Member 2 — Clinical Operations (22.5%)

### Responsibilities

- Doctor consultation module
- EMR module
- Prescription management
- Doctor-facing UI screens

### Owned Modules

```
consultations/
emr/
```

### Frontend Screens

- Doctor dashboard
- Consultation workspace
- Prescription form
- EMR upload and viewer
- Medical record search

---

## Member 3 — Patient Operations (22.5%)

### Responsibilities

- Patient management
- Appointment management
- Billing UI
- Notifications UI
- Analytics UI (D3.js charts)

### Owned Modules

```
patients/
appointments/
billing/        (UI + business logic; Razorpay SDK owned by Shahid)
notifications/
```

### Frontend Screens

- Patient dashboard
- Appointment booking flow
- Payment checkout
- Notification center
- Analytics dashboard (admin view)

---

## Development Rules

### Rule 1: Shahid Owns Foundation

Before any module development begins, Shahid must complete:

1. Database schema (`Documentation/database-schema.md`)
2. Folder structure (`Documentation/project-structure-guide.md`)
3. API contracts (`Documentation/api-contracts.md`)

No module implementation starts until these are approved.

### Rule 2: No Cross-Module Edits Without Discussion

Nobody modifies another person's module without prior discussion and agreement. This includes:

- Route handlers
- Service logic
- Frontend pages owned by another member

**Exception:** Shahid may integrate modules during final integration with team notification.

### Rule 3: AI Module Is Independent

Other modules call AI via HTTP only:

```
appointments/  →  POST /api/ai/analyze-symptoms
consultations/ → POST /api/ai/summarize-records
patients/    →  POST /api/ai/explain-prescription
```

AI logic must remain inside `ai/`. No Gemini SDK imports outside the AI module.

### Rule 4: End-to-End Module Ownership

Each owner is responsible for their module's:

- Backend routes, controllers, services
- Frontend pages and components
- Unit/integration tests (if applicable)
- Feature spec accuracy

### Rule 5: Shared Changes Go Through Shahid

Changes affecting multiple modules require Shahid's review:

- Prisma schema changes
- Shared middleware
- Auth/RBAC middleware updates
- API response format changes

---

## Documentation Ownership

| Document | Owner |
|----------|-------|
| SRS.md | Shahid |
| database-schema.md | Shahid |
| api-contracts.md | Shahid |
| audit-log-spec.md | Shahid |
| deployment-guide.md | Shahid |
| coding-standards.md | Shahid |
| error-handling.md | Shahid |
| project-structure-guide.md | Shahid |
| prompt-guidelines.md | Shahid |
| prompts/foundation-prompt.md | Shahid |
| prompts/integration-prompts.md | Shahid |
| feature-specs/auth.md | Shahid |
| feature-specs/ai.md | Shahid |
| feature-specs/audit-logs.md | Shahid |
| feature-specs/analytics.md | Shahid (backend), Member 3 (UI notes) |
| feature-specs/consultations.md | Member 2 |
| feature-specs/emr.md | Member 2 |
| feature-specs/patients.md | Member 3 |
| feature-specs/appointments.md | Member 3 |
| feature-specs/billing.md | Member 3 |
| feature-specs/notifications.md | Member 3 |
| prompts/auth-prompts.md | Shahid |
| prompts/ai-prompts.md | Shahid |
| prompts/audit-log-prompts.md | Shahid |
| prompts/consultation-prompts.md | Member 2 |
| prompts/emr-prompts.md | Member 2 |
| prompts/patient-prompts.md | Member 3 |
| prompts/appointment-prompts.md | Member 3 |
| prompts/billing-prompts.md | Member 3 |
| prompts/notification-prompts.md | Member 3 |
| prompts/analytics-prompts.md | Member 3 |

---

## Escalation

1. Module-level decisions → module owner
2. Cross-module conflicts → Shahid
3. Architecture or stack changes → requires explicit team approval (frozen by default)
