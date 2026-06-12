# Feature Specification: Doctor Consultations

**Module:** `consultations/`  
**Owner:** Dakshesh Jain  
**Version:** 1.0

---

## Overview

Manages the clinical consultation workflow: viewing patient history, recording diagnosis, creating treatment plans, generating prescriptions, and completing consultations.

---

## Features

### F-CON-01: Start Consultation

- Doctor starts consultation from a `CONFIRMED` appointment
- Creates `Consultation` record linked to appointment
- Sets appointment status to `IN_CONSULTATION`
- Records `startedAt` timestamp

### F-CON-02: View Patient History

- Before/during consultation, doctor views:
  - Patient demographics and allergies
  - Previous appointments and diagnoses
  - Existing prescriptions
  - Medical records list
- Can call AI summarizer: `POST /api/ai/summarize-records`

### F-CON-03: Record Diagnosis

- Doctor updates consultation with:
  - Diagnosis
  - Treatment plan
  - Clinical notes

### F-CON-04: Generate Prescription

- Doctor creates prescription linked to consultation
- Medications stored as JSON array
- Triggers notification: `PRESCRIPTION_READY` to patient
- Triggers audit log: `PRESCRIPTION_CREATED`

### F-CON-05: Complete Consultation

- Doctor marks consultation as complete
- Sets `completedAt` timestamp
- Sets appointment status to `COMPLETED`

### F-CON-06: List Consultations

- Doctor sees own consultations
- Admin sees all consultations
- Patient can view own completed consultations

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-CON-01 | Doctor | View patient history before consultation | I am prepared for the visit |
| US-CON-02 | Doctor | Record diagnosis and treatment | Patient care is documented |
| US-CON-03 | Doctor | Generate a prescription | Patient receives medication instructions |
| US-CON-04 | Doctor | Use AI to summarize history | I quickly understand complex histories |
| US-CON-05 | Patient | View my consultation results | I understand my diagnosis |

---

## API Endpoints

See `api-contracts.md` — Section 4: Consultations Module.

---

## Database Tables

- `consultations`
- `prescriptions`
- `appointments`

---

## Prescription Data Structure

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

## RBAC Matrix

| Endpoint | ADMIN | DOCTOR | PATIENT |
|----------|-------|--------|---------|
| GET `/consultations` | Yes | Yes (own) | No |
| GET `/consultations/:id` | Yes | Yes (own) | Yes (own) |
| POST `/consultations` | No | Yes | No |
| PUT `/consultations/:id` | No | Yes (own) | No |
| POST `/consultations/:id/prescription` | No | Yes (own) | No |
| PUT `/consultations/:id/complete` | No | Yes (own) | No |

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Consultation Workspace | `/doctor/consultations/:id` | DOCTOR |
| Consultation List | `/doctor/consultations` | DOCTOR |
| Patient Consultation View | `/patient/consultations/:id` | PATIENT |

### Consultation Workspace Layout

```
┌─────────────────────────────────────────┐
│ Patient Info + Allergies                │
├─────────────────────────────────────────┤
│ Medical History (with AI Summarize btn) │
├─────────────────────────────────────────┤
│ Diagnosis Form                          │
│ Treatment Plan Form                     │
│ Clinical Notes                          │
├─────────────────────────────────────────┤
│ Prescription Builder                    │
├─────────────────────────────────────────┤
│ [Complete Consultation]                 │
└─────────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Doctor can start consultation from confirmed appointment
- [ ] Patient history displayed in consultation workspace
- [ ] Diagnosis and treatment plan can be saved
- [ ] Prescription created with multiple medications
- [ ] Notification sent to patient on prescription creation
- [ ] Audit log created on prescription creation
- [ ] Consultation completion updates appointment status
- [ ] AI summarizer integration works from consultation view
