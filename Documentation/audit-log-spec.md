# Audit Log Specification

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Owner:** Shahid  
**Module:** `backend/src/modules/audit-logs/`

---

## Purpose

Audit logs provide an immutable activity trail for hospital administrators. They track security-relevant and operational events without storing sensitive data.

---

## Tracked Events

| Action | Trigger | Entity Type | Who Can Trigger |
|--------|---------|-------------|-----------------|
| `LOGIN` | Successful login | User | Any role |
| `LOGOUT` | User logout | User | Any role |
| `PATIENT_CREATED` | Patient profile created | PatientProfile | ADMIN, self-registration |
| `DOCTOR_CREATED` | Doctor account created | DoctorProfile | ADMIN |
| `APPOINTMENT_CREATED` | New appointment booked | Appointment | PATIENT |
| `APPOINTMENT_CANCELLED` | Appointment cancelled | Appointment | PATIENT, ADMIN |
| `PRESCRIPTION_CREATED` | Prescription generated | Prescription | DOCTOR |
| `PAYMENT_SUCCESS` | Payment verified successfully | Payment | PATIENT (via Razorpay) |
| `PAYMENT_FAILED` | Payment verification failed | Payment | PATIENT (via Razorpay) |

---

## Audit Log Record Structure

```json
{
  "id": "uuid",
  "userId": "uuid or null",
  "action": "APPOINTMENT_CREATED",
  "entityType": "Appointment",
  "entityId": "uuid",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "doctorId": "uuid",
    "scheduledAt": "2026-06-15T10:00:00Z"
  },
  "createdAt": "2026-06-10T14:30:00Z"
}
```

---

## Metadata Per Action

### LOGIN

```json
{
  "role": "PATIENT",
  "email": "patient@example.com"
}
```

### LOGOUT

```json
{
  "role": "DOCTOR"
}
```

### PATIENT_CREATED

```json
{
  "patientId": "uuid",
  "createdBy": "ADMIN | SELF"
}
```

### DOCTOR_CREATED

```json
{
  "doctorId": "uuid",
  "departmentId": "uuid",
  "specialization": "Cardiology"
}
```

### APPOINTMENT_CREATED

```json
{
  "appointmentId": "uuid",
  "doctorId": "uuid",
  "patientId": "uuid",
  "scheduledAt": "2026-06-15T10:00:00Z"
}
```

### APPOINTMENT_CANCELLED

```json
{
  "appointmentId": "uuid",
  "previousStatus": "CONFIRMED",
  "cancelledBy": "PATIENT | ADMIN",
  "reason": "Schedule conflict"
}
```

### PRESCRIPTION_CREATED

```json
{
  "prescriptionId": "uuid",
  "consultationId": "uuid",
  "medicationCount": 2
}
```

### PAYMENT_SUCCESS

```json
{
  "paymentId": "uuid",
  "invoiceId": "uuid",
  "amount": 500.00,
  "razorpayPaymentId": "pay_xxx"
}
```

### PAYMENT_FAILED

```json
{
  "paymentId": "uuid",
  "invoiceId": "uuid",
  "amount": 500.00,
  "reason": "Verification failed"
}
```

---

## What NOT to Log

- Passwords or password hashes
- JWT or refresh tokens
- Full Razorpay signatures
- Full medical record content
- Full prescription medication details
- Credit card or bank details

---

## Implementation Pattern

Audit logging is a **cross-cutting concern**. Each module calls the audit service after successful operations.

```javascript
// utils/auditLogger.js
import { auditLogService } from '../modules/audit-logs/audit-logs.service.js';

export async function logAudit({ userId, action, entityType, entityId, metadata, req }) {
  await auditLogService.create({
    userId,
    action,
    entityType,
    entityId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    metadata
  });
}
```

### Usage in Auth Service

```javascript
await logAudit({
  userId: user.id,
  action: 'LOGIN',
  entityType: 'User',
  entityId: user.id,
  metadata: { role: user.role, email: user.email },
  req
});
```

---

## Integration Points

| Module | Event | Call Location |
|--------|-------|---------------|
| auth | LOGIN, LOGOUT, PATIENT_CREATED, DOCTOR_CREATED | `auth.service.js` |
| patients | PATIENT_CREATED | `patients.service.js` (admin create) |
| appointments | APPOINTMENT_CREATED, APPOINTMENT_CANCELLED | `appointments.service.js` |
| consultations | PRESCRIPTION_CREATED | `consultations.service.js` |
| billing | PAYMENT_SUCCESS, PAYMENT_FAILED | `billing.service.js` |

---

## Admin UI Requirements

- Activity feed on admin dashboard (latest 10 events)
- Full audit log page with filters:
  - Action type
  - Date range
  - User
- Paginated table view
- Read-only — no edit or delete

---

## API Endpoints

See `api-contracts.md` — Audit Logs Module.

---

## Retention

For this portfolio project, logs are retained indefinitely. No automatic purge required.

---

## Security

- Only ADMIN role can access audit log endpoints
- Audit logs are append-only (no UPDATE or DELETE operations)
- Failed login attempts may be logged but are optional for v1
