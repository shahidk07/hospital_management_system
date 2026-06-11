# Feature Specification: Patient Management

**Module:** `patients/`  
**Owner:** Member 3  
**Version:** 1.0

---

## Overview

Manages patient profiles, demographics, and medical history access. Patients manage their own profile; admins manage all patients; doctors view assigned patients.

---

## Features

### F-PAT-01: View Own Profile

- Patient views their profile via `GET /api/patients/me`
- Includes: name, DOB, gender, phone, address, blood group, allergies

### F-PAT-02: Update Own Profile

- Patient updates editable fields: phone, address, blood group, allergies
- Cannot change: email, name, DOB, gender (admin only)

### F-PAT-03: Admin List Patients

- Paginated list with search by name, email, phone
- `GET /api/patients?page=1&limit=10&search=john`

### F-PAT-04: Admin Create Patient

- Admin creates patient account (alternative to self-registration)
- Creates User + PatientProfile

### F-PAT-05: Admin Update Patient

- Admin can update any patient field

### F-PAT-06: View Patient by ID

- Admin and doctors can view patient details
- Doctors see patients they have appointments with

### F-PAT-07: Patient Medical History

- `GET /api/patients/:id/history`
- Returns summary: appointments, consultations, prescriptions, records count
- Used by doctors before consultation

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-PAT-01 | Patient | View and update my profile | My information stays current |
| US-PAT-02 | Admin | List and search patients | I can manage the patient database |
| US-PAT-03 | Doctor | View patient history | I can prepare for consultation |

---

## API Endpoints

See `api-contracts.md` — Section 2: Patients Module.

---

## Database Tables

- `users`
- `patient_profiles`

---

## RBAC Matrix

| Endpoint | ADMIN | DOCTOR | PATIENT |
|----------|-------|--------|---------|
| GET `/patients` | Yes | No | No |
| GET `/patients/me` | No | No | Yes |
| PUT `/patients/me` | No | No | Yes |
| GET `/patients/:id` | Yes | Yes* | No |
| POST `/patients` | Yes | No | No |
| PUT `/patients/:id` | Yes | No | No |
| GET `/patients/:id/history` | Yes | Yes* | No |

*Doctor can only access patients with existing appointments.

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| My Profile | `/patient/profile` | PATIENT |
| Patient List | `/admin/patients` | ADMIN |
| Patient Detail | `/admin/patients/:id` | ADMIN |
| Patient History | `/doctor/patients/:id` | DOCTOR |

---

## Acceptance Criteria

- [ ] Patient can view and update own profile
- [ ] Admin can list, search, create, and update patients
- [ ] Doctor can view patient details for assigned patients
- [ ] Medical history endpoint returns aggregated data
- [ ] Unauthorized access returns 403
- [ ] Pagination works on patient list
