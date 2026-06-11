# Feature Specification: Authentication & RBAC

**Module:** `auth/`  
**Owner:** Shahid  
**Version:** 1.0

---

## Overview

Handles user registration, login, logout, JWT token management, refresh tokens, and role-based access control for three roles: ADMIN, DOCTOR, PATIENT.

---

## Features

### F-AUTH-01: Patient Registration

- Public endpoint for patient self-registration
- Creates `User` (role: PATIENT) + `PatientProfile`
- Password hashed with bcrypt (salt rounds: 12)
- Returns access + refresh tokens on success
- Triggers audit log: `PATIENT_CREATED`

### F-AUTH-02: Login

- Email + password authentication
- Returns JWT access token (15 min expiry) and refresh token (7 day expiry)
- Triggers audit log: `LOGIN`
- Returns 401 for invalid credentials (generic message)

### F-AUTH-03: Logout

- Invalidates refresh token in database
- Triggers audit log: `LOGOUT`

### F-AUTH-04: Token Refresh

- Accepts refresh token, validates expiry
- Issues new access token
- Optionally rotates refresh token

### F-AUTH-05: Admin Creates Doctor

- Admin-only endpoint
- Creates `User` (role: DOCTOR) + `DoctorProfile`
- Doctors cannot self-register
- Triggers audit log: `DOCTOR_CREATED`

### F-AUTH-06: Get Current User

- Returns authenticated user's profile based on role
- Includes role-specific profile data (patient or doctor details)

### F-AUTH-07: RBAC Middleware

- `authenticate` — verifies JWT, attaches `req.user`
- `authorize(...roles)` — checks user role against allowed roles

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-AUTH-01 | Patient | Register with my details | I can book appointments |
| US-AUTH-02 | User | Login securely | I can access my dashboard |
| US-AUTH-03 | Admin | Create doctor accounts | Doctors can manage consultations |
| US-AUTH-04 | User | Stay logged in | I don't re-login every 15 minutes |

---

## API Endpoints

See `api-contracts.md` — Section 1: Auth Module.

---

## Database Tables

- `users`
- `refresh_tokens`
- `patient_profiles` (created on registration)
- `doctor_profiles` (created by admin)

---

## Security Requirements

- Passwords minimum 8 characters
- bcrypt with 12 salt rounds
- JWT signed with separate secrets for access and refresh
- Refresh tokens stored in database (allows revocation)
- Rate limit login: 10 attempts per minute per IP

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Login | `/login` | Public |
| Register | `/register` | Public |
| Create Doctor | `/admin/doctors/create` | ADMIN |

---

## Acceptance Criteria

- [ ] Patient can register and receive tokens
- [ ] Login returns valid JWT with correct role
- [ ] Expired access token can be refreshed
- [ ] Logout invalidates refresh token
- [ ] Admin can create doctor accounts
- [ ] Protected routes reject unauthenticated requests (401)
- [ ] Protected routes reject unauthorized roles (403)
- [ ] Passwords are never stored in plain text
- [ ] Audit logs created for login, logout, patient/doctor creation
