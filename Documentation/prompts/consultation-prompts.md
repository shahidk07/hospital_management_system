# Development Prompts: Consultations

**Module:** `consultations/`  
**Owner:** Member 2

---

## Prompt: Implement Consultation Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the Doctor Consultation module.

References:
- Feature spec: Documentation/feature-specs/consultations.md
- API contract: Documentation/api-contracts.md (Section 4)
- Database: consultations, prescriptions, appointments
- Notifications: PRESCRIPTION_READY trigger
- Audit: PRESCRIPTION_CREATED trigger

Backend files:
- consultations.routes.js
- consultations.controller.js
- consultations.service.js
- consultations.validation.js

Endpoints:
- GET /api/consultations (doctor: own, admin: all)
- GET /api/consultations/:id
- POST /api/consultations (start from confirmed appointment)
- PUT /api/consultations/:id (update diagnosis/treatment)
- POST /api/consultations/:id/prescription
- PUT /api/consultations/:id/complete

Workflow:
1. Doctor starts consultation → creates Consultation, sets appointment to IN_CONSULTATION
2. Doctor records diagnosis, treatment plan, notes
3. Doctor creates prescription (medications as JSON array)
4. Doctor completes consultation → sets appointment to COMPLETED

On prescription creation:
- Store medications JSON in prescriptions table
- Notify patient (PRESCRIPTION_READY)
- Audit log (PRESCRIPTION_CREATED)

Frontend:
- /doctor/consultations — list of consultations
- /doctor/consultations/:id — consultation workspace with:
  - Patient info and allergies panel
  - Medical history section (with "Summarize with AI" button calling POST /api/ai/summarize-records)
  - Diagnosis and treatment form
  - Prescription builder (add/remove medications)
  - Complete consultation button

Prescription medication fields: name, dosage, frequency, duration, instructions

Do NOT:
- Allow starting consultation on non-confirmed appointments
- Store prescription data outside the prescriptions table
```
