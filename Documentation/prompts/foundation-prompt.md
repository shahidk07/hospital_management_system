# Foundation Prompt

Use this prompt as the base context for ALL development sessions in this project.

---

## Project

AI-Powered Hospital Management System — a deployable portfolio project demonstrating enterprise-style full-stack development with AI integration.

**This is NOT a production hospital system.**

---

## Frozen Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, D3.js |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | JWT + Refresh Tokens + bcrypt |
| AI | Gemini API (gemini-1.5-flash) |
| Payments | Razorpay (test mode) |
| Files | Cloudinary |
| Deployment | Render |

**Do NOT suggest:** NestJS, Django, Spring Boot, MongoDB, MySQL, OpenAI, Claude, microservices, Kafka, Redis, Kubernetes.

---

## Architecture

Monolithic Express app with modular structure:

```
backend/src/modules/
  auth/ appointments/ patients/ consultations/
  emr/ billing/ analytics/ notifications/
  audit-logs/ ai/
```

Pattern: **routes → controllers → services**

---

## Roles

- **ADMIN** — manage doctors, patients, analytics, audit logs
- **DOCTOR** — consultations, prescriptions, EMR
- **PATIENT** — appointments, payments, records, AI features

---

## Core Modules (Do Not Add More)

1. Authentication & RBAC
2. Patients
3. Appointments
4. Consultations
5. EMR
6. Billing & Payments
7. Analytics
8. Notifications
9. Audit Logs
10. AI Module

---

## AI Features (Only These Three)

1. Symptom Analyzer (patient)
2. Medical Record Summarizer (doctor)
3. Prescription Explainer (patient)

AI logic stays in `ai/` module. Other modules call via HTTP.

---

## Documentation References

Before implementing any feature, read:

1. `Documentation/SRS.md`
2. `Documentation/feature-specs/<module>.md`
3. `Documentation/database-schema.md`
4. `Documentation/api-contracts.md`
5. `Documentation/coding-standards.md`
6. `Documentation/error-handling.md`
7. `Documentation/project-structure-guide.md`

---

## Coding Rules

- Documentation first, database before APIs, APIs before implementation
- No business logic in routes or controllers
- All Prisma calls in services only
- Standard API response format: `{ success, message, data }`
- Throw `AppError` for expected failures
- Never store files in PostgreSQL
- Never commit secrets

---

## Team Ownership

| Module | Owner |
|--------|-------|
| auth, ai, audit-logs, analytics (backend) | Shahid |
| consultations, emr | Dakshesh Jain |
| patients, appointments, billing, notifications, analytics (UI) | Sanskar Agrawal |

Do not modify another person's module without discussion.
