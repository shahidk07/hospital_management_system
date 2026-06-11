# Development Prompts: Authentication & RBAC

**Module:** `auth/`  
**Owner:** Shahid

---

## Prompt: Implement Auth Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the complete Authentication & RBAC module.

References:
- Feature spec: Documentation/feature-specs/auth.md
- API contract: Documentation/api-contracts.md (Section 1)
- Database: users, refresh_tokens, patient_profiles, doctor_profiles
- Audit spec: Documentation/audit-log-spec.md

Implement:
1. auth.routes.js — all auth endpoints
2. auth.controller.js — request handling
3. auth.service.js — business logic, Prisma, bcrypt, JWT
4. auth.validation.js — input validation
5. middleware/auth.middleware.js — JWT verification
6. middleware/rbac.middleware.js — role authorization

Endpoints:
- POST /api/auth/register (patient self-registration)
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/doctors (admin only)

Requirements:
- bcrypt salt rounds: 12
- JWT access token: 15 min expiry
- Refresh token: 7 day expiry, stored in DB
- On register: create User + PatientProfile, return tokens
- On admin create doctor: create User + DoctorProfile
- Audit logs: LOGIN, LOGOUT, PATIENT_CREATED, DOCTOR_CREATED
- Generic error message for invalid login (don't reveal which field failed)

Frontend (if requested):
- Login page at /login
- Register page at /register
- AuthContext with token management
- Axios interceptor for token refresh

Do NOT:
- Allow doctor self-registration
- Store passwords in plain text
- Use sessions (JWT only)
- Import Gemini or Razorpay in this module
```

---

## Prompt: Implement Auth Middleware

```
Task: Implement authentication and RBAC middleware.

Files:
- middleware/auth.middleware.js
- middleware/rbac.middleware.js

auth.middleware.js:
- Extract Bearer token from Authorization header
- Verify JWT with JWT_ACCESS_SECRET
- Attach decoded user (id, email, role) to req.user
- Return 401 if missing, invalid, or expired

rbac.middleware.js:
- Factory function: authorize(...allowedRoles)
- Check req.user.role against allowedRoles
- Return 403 if role not allowed

Usage:
router.post('/doctors', authenticate, authorize('ADMIN'), createDoctor);
router.get('/me', authenticate, getMe);
```
