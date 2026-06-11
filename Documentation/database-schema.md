# Database Schema

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**ORM:** Prisma  
**Database:** PostgreSQL (Neon)  
**Owner:** Shahid

This document is the authoritative database design. All Prisma migrations must match this schema.

---

## Design Principles

1. Relational model — no document store patterns
2. Files stored in Cloudinary; only URLs stored in PostgreSQL
3. Soft deletes not required; use status fields where applicable
4. All tables include `createdAt` and `updatedAt` timestamps
5. UUIDs used for primary keys

---

## Entity Relationship Overview

```
User ──┬── PatientProfile
       ├── DoctorProfile
       └── RefreshToken

Department ── DoctorProfile

PatientProfile ──┬── Appointment ──┬── Consultation ── Prescription
                 │                 └── Invoice ── Payment
                 └── MedicalRecord

Notification ── User
AuditLog ── User (optional)
```

---

## Enums

```prisma
enum Role {
  ADMIN
  DOCTOR
  PATIENT
}

enum AppointmentStatus {
  REQUESTED
  CONFIRMED
  IN_CONSULTATION
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum MedicalRecordType {
  PRESCRIPTION
  LAB_REPORT
  XRAY
  MRI
  OTHER
}

enum NotificationType {
  APPOINTMENT_REMINDER
  REPORT_AVAILABLE
  PRESCRIPTION_READY
  NEW_APPOINTMENT
  CONSULTATION_ASSIGNED
}

enum AuditAction {
  LOGIN
  LOGOUT
  PATIENT_CREATED
  DOCTOR_CREATED
  APPOINTMENT_CREATED
  APPOINTMENT_CANCELLED
  PRESCRIPTION_CREATED
  PAYMENT_SUCCESS
  PAYMENT_FAILED
}

enum UrgencyLevel {
  LOW
  MEDIUM
  HIGH
  EMERGENCY
}
```

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth & Users ───────────────────────────────────────────

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  role          Role
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  patientProfile  PatientProfile?
  doctorProfile   DoctorProfile?
  refreshTokens   RefreshToken[]
  notifications   Notification[]
  auditLogs       AuditLog[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// ─── Departments ────────────────────────────────────────────

model Department {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  doctors      DoctorProfile[]
  appointments Appointment[]

  @@map("departments")
}

// ─── Patient ────────────────────────────────────────────────

model PatientProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  firstName   String
  lastName    String
  dateOfBirth DateTime
  gender      String
  phone       String
  address     String?
  bloodGroup  String?
  allergies   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  appointments    Appointment[]
  medicalRecords  MedicalRecord[]

  @@map("patient_profiles")
}

// ─── Doctor ─────────────────────────────────────────────────

model DoctorProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  firstName      String
  lastName       String
  specialization String
  departmentId   String
  phone          String
  licenseNumber  String   @unique
  isAvailable    Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  department     Department      @relation(fields: [departmentId], references: [id])
  appointments   Appointment[]
  consultations  Consultation[]

  @@index([departmentId])
  @@map("doctor_profiles")
}

// ─── Appointments ───────────────────────────────────────────

model Appointment {
  id           String            @id @default(uuid())
  patientId    String
  doctorId     String
  departmentId String
  scheduledAt  DateTime
  status       AppointmentStatus @default(REQUESTED)
  reason       String?
  notes        String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  patient      PatientProfile @relation(fields: [patientId], references: [id])
  doctor       DoctorProfile  @relation(fields: [doctorId], references: [id])
  department   Department     @relation(fields: [departmentId], references: [id])
  consultation Consultation?
  invoice      Invoice?

  @@index([patientId])
  @@index([doctorId])
  @@index([scheduledAt])
  @@index([status])
  @@map("appointments")
}

// ─── Consultations ──────────────────────────────────────────

model Consultation {
  id            String   @id @default(uuid())
  appointmentId String   @unique
  doctorId      String
  diagnosis     String?
  treatmentPlan String?
  notes         String?
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  appointment  Appointment   @relation(fields: [appointmentId], references: [id])
  doctor       DoctorProfile @relation(fields: [doctorId], references: [id])
  prescription Prescription?

  @@index([doctorId])
  @@map("consultations")
}

// ─── Prescriptions ──────────────────────────────────────────

model Prescription {
  id             String   @id @default(uuid())
  consultationId String   @unique
  medications    Json     // [{ name, dosage, frequency, duration, instructions }]
  instructions   String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  consultation Consultation @relation(fields: [consultationId], references: [id])

  @@map("prescriptions")
}

// ─── EMR ────────────────────────────────────────────────────

model MedicalRecord {
  id          String            @id @default(uuid())
  patientId   String
  type        MedicalRecordType
  title       String
  description String?
  fileUrl     String            // Cloudinary URL
  filePublicId String           // Cloudinary public_id for deletion
  uploadedBy  String            // userId of uploader
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  patient PatientProfile @relation(fields: [patientId], references: [id])

  @@index([patientId])
  @@index([type])
  @@map("medical_records")
}

// ─── Billing ────────────────────────────────────────────────

model Invoice {
  id            String   @id @default(uuid())
  appointmentId String   @unique
  amount        Decimal  @db.Decimal(10, 2)
  currency      String   @default("INR")
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  appointment Appointment @relation(fields: [appointmentId], references: [id])
  payment     Payment?

  @@map("invoices")
}

model Payment {
  id                String        @id @default(uuid())
  invoiceId         String        @unique
  razorpayOrderId   String        @unique
  razorpayPaymentId String?
  razorpaySignature String?
  amount            Decimal       @db.Decimal(10, 2)
  status            PaymentStatus @default(PENDING)
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  invoice Invoice @relation(fields: [invoiceId], references: [id])

  @@index([status])
  @@map("payments")
}

// ─── Notifications ──────────────────────────────────────────

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  metadata  Json?            // { appointmentId, recordId, etc. }
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}

// ─── Audit Logs ─────────────────────────────────────────────

model AuditLog {
  id         String      @id @default(uuid())
  userId     String?
  action     AuditAction
  entityType String?     // e.g. "Appointment", "Patient"
  entityId   String?
  ipAddress  String?
  userAgent  String?
  metadata   Json?
  createdAt  DateTime    @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([action])
  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## Table Summary

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | Authentication and role | 1:1 with patient/doctor profiles |
| `refresh_tokens` | Session renewal | N:1 with users |
| `departments` | Hospital departments | 1:N with doctors |
| `patient_profiles` | Patient demographics | 1:N appointments, records |
| `doctor_profiles` | Doctor credentials | 1:N appointments, consultations |
| `appointments` | Scheduling | Links patient, doctor, department |
| `consultations` | Clinical sessions | 1:1 with appointment |
| `prescriptions` | Medication orders | 1:1 with consultation |
| `medical_records` | EMR files | N:1 with patient |
| `invoices` | Billing | 1:1 with appointment |
| `payments` | Razorpay transactions | 1:1 with invoice |
| `notifications` | In-app alerts | N:1 with users |
| `audit_logs` | Activity tracking | N:1 with users (optional) |

---

## Indexes

Critical query paths and their indexes:

| Query | Index |
|-------|-------|
| Login by email | `users.email` (unique) |
| Doctor availability by date | `appointments.doctorId`, `appointments.scheduledAt` |
| Patient appointment history | `appointments.patientId` |
| Unread notifications | `notifications.userId, isRead` |
| Audit log feed | `audit_logs.createdAt` |
| Medical records by patient | `medical_records.patientId` |

---

## Seed Data Requirements

Initial seed should include:

1. One ADMIN user
2. Departments: General Medicine, Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology
3. At least 3 doctor accounts (one per department minimum)
4. Optional: 2 sample patients for demo

---

## Migration Rules

1. All schema changes require Shahid approval
2. Run `npx prisma migrate dev` locally before pushing
3. Production migrations via `npx prisma migrate deploy`
4. Never edit migration files manually after application
5. Document breaking changes in PR description

---

## Data Constraints

| Constraint | Rule |
|------------|------|
| Email uniqueness | One account per email across all roles |
| Appointment uniqueness | No double-booking: same doctor + overlapping time slot |
| Invoice amount | Must be positive; currency defaults to INR |
| Medical record file | `fileUrl` must be a valid Cloudinary HTTPS URL |
| Prescription medications | JSON array with required fields: name, dosage, frequency, duration |

---

## JSON Field Schemas

### Prescription.medications

```json
[
  {
    "name": "Paracetamol",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "duration": "5 days",
    "instructions": "Take after meals"
  }
]
```

### Notification.metadata

```json
{
  "appointmentId": "uuid",
  "recordId": "uuid",
  "link": "/appointments/uuid"
}
```

### AuditLog.metadata

```json
{
  "previousStatus": "CONFIRMED",
  "newStatus": "CANCELLED",
  "amount": 500.00
}
```
