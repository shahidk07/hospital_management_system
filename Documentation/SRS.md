# Software Requirements Specification (SRS)

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Status:** Frozen  
**Last Updated:** June 2026

---

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements for the AI-Powered Hospital Management System. It serves as the authoritative reference for all design, development, and testing activities.

All documentation, code, database schema, API contracts, prompts, and architecture must conform to this specification and the frozen project context.

### 1.2 Scope

The system is a deployable portfolio project demonstrating enterprise-style architecture for a single-hospital environment. It is **not** intended for production clinical use.

**In scope:**

- Authentication and Role-Based Access Control (RBAC)
- Patient management
- Appointment scheduling
- Doctor consultations
- Electronic Medical Records (EMR)
- Billing and payments (Razorpay)
- Analytics dashboard
- In-app notifications
- Audit logging
- Three approved AI features (Gemini API)

**Out of scope:**

- Pharmacy management
- Laboratory management
- Emergency management
- Bed allocation
- Insurance claims
- Multi-hospital support
- AI chatbot, voice assistant, or AI diagnosis engine

### 1.3 Definitions

| Term | Definition |
|------|------------|
| EMR | Electronic Medical Records — digital storage of prescriptions, lab reports, and imaging |
| RBAC | Role-Based Access Control — authorization based on user role |
| JWT | JSON Web Token — used for access authentication |
| Consultation | A clinical session between a doctor and patient, linked to an appointment |

### 1.4 References

- `README.md` — Project overview
- `Documentation/database-schema.md` — Database design
- `Documentation/api-contracts.md` — API specifications
- `Documentation/feature-specs/` — Per-module feature specifications

---

## 2. Overall Description

### 2.1 Product Perspective

The system is a full-stack web application with:

- **Frontend:** React, Tailwind CSS, D3.js (hosted on Render)
- **Backend:** Node.js, Express.js (hosted on Render)
- **Database:** PostgreSQL via Neon, accessed through Prisma ORM
- **External services:** Gemini API, Razorpay, Cloudinary

### 2.2 User Classes and Characteristics

| Role | Description | Primary Actions |
|------|-------------|-----------------|
| **ADMIN** | Hospital administrator | Create doctors, manage patients, view analytics, review audit logs |
| **DOCTOR** | Licensed medical practitioner | Manage consultations, view patient history, create prescriptions, use AI summarizer |
| **PATIENT** | Registered patient | Book appointments, pay bills, view prescriptions/reports, use AI features |

### 2.3 Operating Environment

- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Internet connectivity required
- Hosted on Render with Neon PostgreSQL

### 2.4 Design and Implementation Constraints

- Tech stack is frozen (see Section 2.1)
- Monolithic architecture — no microservices, Kafka, Redis, or Kubernetes
- Documentation-first development order: SRS → Feature Specs → Database → APIs → Prompts → Implementation
- AI module is independent; other modules call AI via HTTP endpoints only

### 2.5 Assumptions and Dependencies

- Razorpay operates in test mode during development
- Cloudinary handles all file storage (no files in PostgreSQL)
- Gemini API is available and configured via environment variables
- Single timezone (IST) for appointment scheduling unless otherwise noted

---

## 3. System Features

### 3.1 Module Overview

| # | Module | Owner |
|---|--------|-------|
| 1 | Authentication & RBAC | Shahid |
| 2 | Patients | Sanskar Agrawal |
| 3 | Appointments | Sanskar Agrawal |
| 4 | Consultations | Dakshesh Jain |
| 5 | EMR | Dakshesh Jain |
| 6 | Billing & Payments | Sanskar Agrawal |
| 7 | Analytics | Shahid (backend), Sanskar Agrawal (frontend) |
| 8 | Notifications | Sanskar Agrawal |
| 9 | Audit Logs | Shahid |
| 10 | AI Module | Shahid |

Detailed specifications: `Documentation/feature-specs/`

### 3.2 Core Workflow

```
Patient Registration
  → Appointment Booking
  → Payment
  → Doctor Consultation
  → Prescription Generation
  → Medical Record Storage
  → AI Assistance
  → Analytics & Monitoring
```

### 3.3 Appointment Status Flow

```
REQUESTED → CONFIRMED → IN_CONSULTATION → COMPLETED
                                        ↘ CANCELLED
```

---

## 4. Functional Requirements

### 4.1 Authentication & RBAC (FR-AUTH)

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | System shall allow patient self-registration |
| FR-AUTH-02 | System shall allow login with email and password |
| FR-AUTH-03 | System shall issue JWT access tokens on successful login |
| FR-AUTH-04 | System shall issue refresh tokens for session renewal |
| FR-AUTH-05 | System shall hash passwords with bcrypt before storage |
| FR-AUTH-06 | System shall enforce RBAC with roles: ADMIN, DOCTOR, PATIENT |
| FR-AUTH-07 | Admin shall create doctor accounts (doctors cannot self-register) |
| FR-AUTH-08 | System shall support logout and token invalidation |

### 4.2 Patient Management (FR-PAT)

| ID | Requirement |
|----|-------------|
| FR-PAT-01 | Patients shall create and update their profile |
| FR-PAT-02 | Patients shall view their own profile and medical history |
| FR-PAT-03 | Admin shall create, view, update, and list patients |
| FR-PAT-04 | Doctors shall view assigned patients and their history |

### 4.3 Appointment Management (FR-APT)

| ID | Requirement |
|----|-------------|
| FR-APT-01 | Patients shall select department, doctor, and time slot |
| FR-APT-02 | System shall check doctor availability before booking |
| FR-APT-03 | Patients shall reschedule appointments |
| FR-APT-04 | Patients and admin shall cancel appointments |
| FR-APT-05 | System shall display appointments in calendar view |
| FR-APT-06 | Appointment status shall follow defined state machine |

### 4.4 Consultations (FR-CON)

| ID | Requirement |
|----|-------------|
| FR-CON-01 | Doctors shall view patient history before consultation |
| FR-CON-02 | Doctors shall record diagnosis and treatment plan |
| FR-CON-03 | Doctors shall generate prescriptions linked to consultation |
| FR-CON-04 | Consultations shall be linked to confirmed appointments |

### 4.5 EMR (FR-EMR)

| ID | Requirement |
|----|-------------|
| FR-EMR-01 | System shall store prescriptions, lab reports, X-rays, and MRI reports |
| FR-EMR-02 | Files shall be uploaded to Cloudinary, not PostgreSQL |
| FR-EMR-03 | Authorized users shall view, download, search, and categorize records |
| FR-EMR-04 | Patients shall access their own records; doctors access assigned patients |

### 4.6 Billing & Payments (FR-BIL)

| ID | Requirement |
|----|-------------|
| FR-BIL-01 | System shall generate invoices for appointments |
| FR-BIL-02 | Patients shall pay via Razorpay |
| FR-BIL-03 | System shall track payment status (pending, success, failed) |
| FR-BIL-04 | Payment confirmation shall unlock consultation flow |

### 4.7 Analytics (FR-ANA)

| ID | Requirement |
|----|-------------|
| FR-ANA-01 | Admin shall view total patients, doctors, and appointments |
| FR-ANA-02 | Admin shall view revenue metrics |
| FR-ANA-03 | Admin shall view department performance charts |
| FR-ANA-04 | Visualizations shall use D3.js |

### 4.8 Notifications (FR-NOT)

| ID | Requirement |
|----|-------------|
| FR-NOT-01 | Patients shall receive appointment reminders |
| FR-NOT-02 | Patients shall be notified when reports are available |
| FR-NOT-03 | Patients shall be notified when prescriptions are ready |
| FR-NOT-04 | Doctors shall be notified of new appointments |
| FR-NOT-05 | Doctors shall be notified when consultations are assigned |
| FR-NOT-06 | Notifications shall be in-app (email optional) |

### 4.9 Audit Logs (FR-AUD)

| ID | Requirement |
|----|-------------|
| FR-AUD-01 | System shall log login and logout events |
| FR-AUD-02 | System shall log patient and doctor creation |
| FR-AUD-03 | System shall log appointment creation and cancellation |
| FR-AUD-04 | System shall log prescription creation |
| FR-AUD-05 | System shall log payment success and failure |
| FR-AUD-06 | Admin shall view audit log feed |

### 4.10 AI Module (FR-AI)

| ID | Requirement |
|----|-------------|
| FR-AI-01 | Symptom Analyzer: input symptoms → possible conditions, recommended department, urgency level |
| FR-AI-02 | Medical Record Summarizer: input patient records → short medical summary for doctors |
| FR-AI-03 | Prescription Explainer: input prescription → simple-language explanation for patients |
| FR-AI-04 | AI outputs are informational only — not medical diagnoses |

---

## 5. Non-Functional Requirements

### 5.1 Security (NFR-SEC)

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | All API endpoints except auth registration/login shall require valid JWT |
| NFR-SEC-02 | Role checks shall be enforced at route middleware level |
| NFR-SEC-03 | Sensitive data shall not appear in audit log payloads |
| NFR-SEC-04 | Environment secrets shall not be committed to version control |

### 5.2 Performance (NFR-PERF)

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | API response time target: < 500ms for standard CRUD operations |
| NFR-PERF-02 | AI endpoints may take up to 10 seconds; UI shall show loading state |

### 5.3 Reliability (NFR-REL)

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | Payment webhooks shall be idempotent |
| NFR-REL-02 | Failed AI calls shall return graceful error messages |

### 5.4 Usability (NFR-USE)

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | UI shall be responsive for desktop and tablet |
| NFR-USE-02 | Role-specific dashboards shall show only relevant navigation |

### 5.5 Maintainability (NFR-MAIN)

| ID | Requirement |
|----|-------------|
| NFR-MAIN-01 | Backend shall follow routes → controllers → services pattern |
| NFR-MAIN-02 | Each module shall be self-contained under `backend/src/modules/` |

---

## 6. External Interface Requirements

### 6.1 User Interfaces

- React SPA with role-based routing
- Tailwind CSS for styling
- D3.js for analytics charts

### 6.2 API Interfaces

RESTful JSON APIs documented in `Documentation/api-contracts.md`.

Base URL: `/api`

### 6.3 Database Interfaces

PostgreSQL via Prisma ORM. Schema in `Documentation/database-schema.md`.

### 6.4 External Service Interfaces

| Service | Purpose |
|---------|---------|
| Gemini API | AI symptom analysis, summarization, prescription explanation |
| Razorpay | Payment processing |
| Cloudinary | File upload and CDN delivery |

---

## 7. Success Criteria

### 7.1 Patient Journey

A patient can: register → book appointment → pay online → attend consultation → receive prescription → access medical records → use AI features.

### 7.2 Admin Journey

An admin can: monitor hospital operations → view analytics → review audit logs.

### 7.3 Doctor Journey

A doctor can: manage consultations → access patient history → generate prescriptions → use AI summarization.

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Shahid | Initial SRS |
