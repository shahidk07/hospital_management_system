# Feature Specification: Appointment Management

**Module:** `appointments/`  
**Owner:** Sanskar Agrawal  
**Version:** 1.0

---

## Overview

Handles appointment booking, scheduling, availability checking, rescheduling, cancellation, and status management.

---

## Features

### F-APT-01: Book Appointment

- Patient selects department → doctor → date → time slot
- Creates appointment with status `REQUESTED`
- Triggers notification: `NEW_APPOINTMENT` to doctor
- Triggers audit log: `APPOINTMENT_CREATED`
- Auto-generates invoice for the appointment

### F-APT-02: Check Availability

- Returns available 30-minute slots for a doctor on a given date
- Working hours: 9:00 AM – 5:00 PM IST
- Excludes already booked slots

### F-APT-03: List Appointments

- Role-filtered:
  - PATIENT: own appointments
  - DOCTOR: own appointments
  - ADMIN: all appointments
- Supports filters: status, date range

### F-APT-04: Reschedule

- Patient can reschedule if status is `REQUESTED` or `CONFIRMED`
- Must check new slot availability
- Cannot reschedule to past dates

### F-APT-05: Cancel

- Patient or admin can cancel
- Allowed if status is `REQUESTED`, `CONFIRMED`
- Sets status to `CANCELLED`
- Triggers audit log: `APPOINTMENT_CANCELLED`

### F-APT-06: Update Status

- Doctor/admin updates status during consultation flow
- Valid transitions:
  - `REQUESTED` → `CONFIRMED` (after payment)
  - `CONFIRMED` → `IN_CONSULTATION`
  - `IN_CONSULTATION` → `COMPLETED`
  - `REQUESTED|CONFIRMED` → `CANCELLED`

### F-APT-07: Calendar View

- Doctor sees weekly calendar of appointments
- Admin sees hospital-wide calendar

---

## Status Flow

```
REQUESTED → CONFIRMED → IN_CONSULTATION → COMPLETED
         ↘           ↘                  ↘
          CANCELLED   CANCELLED
```

Payment success moves `REQUESTED` → `CONFIRMED`.

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-APT-01 | Patient | Book an appointment | I can see a doctor |
| US-APT-02 | Patient | See available time slots | I can pick a convenient time |
| US-APT-03 | Patient | Reschedule or cancel | I can adjust my schedule |
| US-APT-04 | Doctor | See my appointment calendar | I can plan my day |

---

## API Endpoints

See `api-contracts.md` — Section 3: Appointments Module.

---

## Database Tables

- `appointments`
- `departments`
- `doctor_profiles`
- `patient_profiles`
- `invoices` (auto-created on booking)

---

## Business Rules

1. No double-booking: same doctor + overlapping time slot
2. Appointments must be in the future at booking time
3. Maximum 1 active appointment per patient per doctor per day
4. Consultation fee is fixed per department (configured in seed or constants)
5. Invoice created automatically when appointment is booked

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Book Appointment | `/patient/appointments/book` | PATIENT |
| My Appointments | `/patient/appointments` | PATIENT |
| Doctor Calendar | `/doctor/appointments` | DOCTOR |
| All Appointments | `/admin/appointments` | ADMIN |

### Booking Flow (UI)

```
Step 1: Select Department
Step 2: Select Doctor
Step 3: Select Date
Step 4: Select Time Slot
Step 5: Confirm & Review
Step 6: Redirect to Payment
```

---

## Acceptance Criteria

- [ ] Patient can complete full booking flow
- [ ] Availability check prevents double-booking
- [ ] Status transitions follow defined rules
- [ ] Reschedule and cancel work correctly
- [ ] Notifications sent on booking
- [ ] Audit logs created on create/cancel
- [ ] Invoice auto-generated on booking
- [ ] Calendar view shows correct appointments per role
