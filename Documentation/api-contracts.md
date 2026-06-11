# API Contracts

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Base URL:** `/api`  
**Owner:** Shahid

All endpoints return JSON. Authentication uses Bearer JWT unless marked Public.

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": []
}
```

### Pagination

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. slot already booked) |
| 500 | Server error |

---

## Authentication

All protected routes require header:

```
Authorization: Bearer <access_token>
```

---

## 1. Auth Module — `/api/auth`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/register` | Public | — | Patient self-registration |
| POST | `/login` | Public | — | Login, returns tokens |
| POST | `/refresh` | Public | — | Refresh access token |
| POST | `/logout` | Required | ALL | Invalidate refresh token |
| GET | `/me` | Required | ALL | Current user profile |
| POST | `/doctors` | Required | ADMIN | Create doctor account |

### POST `/api/auth/register`

**Body:**
```json
{
  "email": "patient@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "phone": "+919876543210",
  "address": "123 Main St"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "PATIENT" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### POST `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "PATIENT" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### POST `/api/auth/refresh`

**Body:**
```json
{ "refreshToken": "..." }
```

### POST `/api/auth/doctors` (Admin)

**Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "departmentId": "uuid",
  "phone": "+919876543210",
  "licenseNumber": "MED-12345"
}
```

---

## 2. Patients Module — `/api/patients`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Required | ADMIN | List all patients |
| GET | `/me` | Required | PATIENT | Own profile |
| PUT | `/me` | Required | PATIENT | Update own profile |
| GET | `/:id` | Required | ADMIN, DOCTOR | Get patient by ID |
| POST | `/` | Required | ADMIN | Create patient (admin) |
| PUT | `/:id` | Required | ADMIN | Update patient |
| GET | `/:id/history` | Required | ADMIN, DOCTOR | Medical history summary |

### GET `/api/patients?page=1&limit=10&search=john`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+919876543210",
        "bloodGroup": "O+",
        "createdAt": "2026-01-15T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
  }
}
```

---

## 3. Appointments Module — `/api/appointments`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Required | ALL | List appointments (role-filtered) |
| GET | `/:id` | Required | ALL | Get appointment details |
| POST | `/` | Required | PATIENT | Book appointment |
| PUT | `/:id/reschedule` | Required | PATIENT | Reschedule |
| PUT | `/:id/cancel` | Required | PATIENT, ADMIN | Cancel |
| PUT | `/:id/status` | Required | DOCTOR, ADMIN | Update status |
| GET | `/availability` | Required | PATIENT | Check doctor availability |
| GET | `/calendar` | Required | DOCTOR, ADMIN | Calendar view |

### POST `/api/appointments`

**Body:**
```json
{
  "doctorId": "uuid",
  "departmentId": "uuid",
  "scheduledAt": "2026-06-15T10:00:00Z",
  "reason": "Chest pain"
}
```

### GET `/api/appointments/availability?doctorId=uuid&date=2026-06-15`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "doctorId": "uuid",
    "date": "2026-06-15",
    "slots": [
      { "time": "09:00", "available": true },
      { "time": "09:30", "available": false },
      { "time": "10:00", "available": true }
    ]
  }
}
```

### PUT `/api/appointments/:id/status`

**Body:**
```json
{ "status": "IN_CONSULTATION" }
```

---

## 4. Consultations Module — `/api/consultations`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Required | DOCTOR, ADMIN | List consultations |
| GET | `/:id` | Required | DOCTOR, ADMIN, PATIENT | Get consultation |
| POST | `/` | Required | DOCTOR | Start consultation |
| PUT | `/:id` | Required | DOCTOR | Update diagnosis/treatment |
| POST | `/:id/prescription` | Required | DOCTOR | Create prescription |
| PUT | `/:id/complete` | Required | DOCTOR | Complete consultation |

### POST `/api/consultations`

**Body:**
```json
{ "appointmentId": "uuid" }
```

### PUT `/api/consultations/:id`

**Body:**
```json
{
  "diagnosis": "Acute bronchitis",
  "treatmentPlan": "Rest, fluids, medication",
  "notes": "Patient reports cough for 5 days"
}
```

### POST `/api/consultations/:id/prescription`

**Body:**
```json
{
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "Three times daily",
      "duration": "7 days",
      "instructions": "Take with food"
    }
  ],
  "instructions": "Complete full course. Return if symptoms worsen."
}
```

---

## 5. EMR Module — `/api/emr`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Required | ALL | List records (role-filtered) |
| GET | `/:id` | Required | ALL | Get record details |
| POST | `/upload` | Required | DOCTOR, ADMIN | Upload medical record |
| DELETE | `/:id` | Required | ADMIN | Delete record |
| GET | `/search` | Required | DOCTOR, ADMIN | Search records |

### POST `/api/emr/upload` (multipart/form-data)

**Fields:**
- `file` — file upload
- `patientId` — UUID
- `type` — PRESCRIPTION | LAB_REPORT | XRAY | MRI | OTHER
- `title` — string
- `description` — optional string

### GET `/api/emr/search?patientId=uuid&type=LAB_REPORT&query=blood`

---

## 6. Billing Module — `/api/billing`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/invoices` | Required | ALL | List invoices |
| GET | `/invoices/:id` | Required | ALL | Get invoice |
| POST | `/invoices` | Required | ADMIN | Create invoice (manual) |
| POST | `/payments/create-order` | Required | PATIENT | Create Razorpay order |
| POST | `/payments/verify` | Required | PATIENT | Verify payment |
| POST | `/payments/webhook` | Public* | — | Razorpay webhook |

*Webhook verified via Razorpay signature, not JWT.

### POST `/api/billing/payments/create-order`

**Body:**
```json
{ "invoiceId": "uuid" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 50000,
    "currency": "INR",
    "keyId": "rzp_test_xxx"
  }
}
```

### POST `/api/billing/payments/verify`

**Body:**
```json
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

---

## 7. Analytics Module — `/api/analytics`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/overview` | Required | ADMIN | Dashboard summary |
| GET | `/revenue` | Required | ADMIN | Revenue trends |
| GET | `/appointments` | Required | ADMIN | Appointment trends |
| GET | `/departments` | Required | ADMIN | Department performance |

### GET `/api/analytics/overview`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 150,
    "totalDoctors": 12,
    "totalAppointments": 320,
    "totalRevenue": 125000.00,
    "appointmentsToday": 8,
    "pendingPayments": 5
  }
}
```

### GET `/api/analytics/revenue?period=monthly&months=6`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "values": [15000, 18000, 22000, 19000, 25000, 26000]
  }
}
```

---

## 8. Notifications Module — `/api/notifications`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Required | ALL | List notifications |
| GET | `/unread-count` | Required | ALL | Unread count |
| PUT | `/:id/read` | Required | ALL | Mark as read |
| PUT | `/read-all` | Required | ALL | Mark all as read |

### GET `/api/notifications?page=1&limit=20&unreadOnly=true`

---

## 9. Audit Logs Module — `/api/audit-logs`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Required | ADMIN | List audit logs |
| GET | `/:id` | Required | ADMIN | Get audit log detail |

### GET `/api/audit-logs?action=LOGIN&page=1&limit=20&from=2026-06-01&to=2026-06-30`

---

## 10. AI Module — `/api/ai`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/analyze-symptoms` | Required | PATIENT | Symptom analyzer |
| POST | `/summarize-records` | Required | DOCTOR | Medical record summarizer |
| POST | `/explain-prescription` | Required | PATIENT | Prescription explainer |

### POST `/api/ai/analyze-symptoms`

**Body:**
```json
{
  "symptoms": ["fever", "cough", "headache"],
  "duration": "3 days",
  "additionalInfo": "Mild chest discomfort"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "possibleConditions": ["Common cold", "Influenza", "Bronchitis"],
    "recommendedDepartment": "General Medicine",
    "urgencyLevel": "MEDIUM",
    "disclaimer": "This is not a medical diagnosis."
  }
}
```

### POST `/api/ai/summarize-records`

**Body:**
```json
{ "patientId": "uuid" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": "Patient has history of hypertension...",
    "keyPoints": {
      "diseases": ["Hypertension"],
      "allergies": ["Penicillin"],
      "surgeries": ["Appendectomy (2018)"],
      "currentMedications": ["Amlodipine 5mg"]
    }
  }
}
```

### POST `/api/ai/explain-prescription`

**Body:**
```json
{ "prescriptionId": "uuid" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "explanation": "Your doctor prescribed Amoxicillin...",
    "medications": [
      {
        "name": "Amoxicillin",
        "simpleExplanation": "An antibiotic that fights bacterial infections..."
      }
    ]
  }
}
```

---

## 11. Departments — `/api/departments`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Required | ALL | List departments |
| GET | `/:id/doctors` | Required | ALL | Doctors in department |

---

## Rate Limiting (Recommended)

| Endpoint Group | Limit |
|----------------|-------|
| Auth (login/register) | 10 req/min per IP |
| AI endpoints | 5 req/min per user |
| General API | 100 req/min per user |

---

## Versioning

Current version: v1 (no prefix). Future breaking changes will use `/api/v2/`.
