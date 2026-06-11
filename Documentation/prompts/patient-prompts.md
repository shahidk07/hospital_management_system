# Development Prompts: Patient Management

**Module:** `patients/`  
**Owner:** Member 3

---

## Prompt: Implement Patient Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the Patient Management module (backend + frontend).

References:
- Feature spec: Documentation/feature-specs/patients.md
- API contract: Documentation/api-contracts.md (Section 2)
- Database: patient_profiles, users

Backend files:
- patients.routes.js
- patients.controller.js
- patients.service.js
- patients.validation.js

Endpoints:
- GET /api/patients (admin, paginated with search)
- GET /api/patients/me (patient, own profile)
- PUT /api/patients/me (patient, update own profile)
- GET /api/patients/:id (admin, doctor)
- POST /api/patients (admin, create patient)
- PUT /api/patients/:id (admin, update patient)
- GET /api/patients/:id/history (admin, doctor)

RBAC:
- Patient can only access /me endpoints
- Doctor can view patients with existing appointments only
- Admin has full access

Frontend pages:
- /patient/profile — view and edit own profile
- /admin/patients — paginated list with search
- /admin/patients/:id — patient detail view
- /doctor/patients/:id — patient history for consultation

History endpoint should return:
- Patient demographics
- Appointment count and recent appointments
- Consultation summaries
- Prescription count
- Medical record count by type

Do NOT:
- Allow patients to change email or name (admin only)
- Access other patients' data without authorization
```
