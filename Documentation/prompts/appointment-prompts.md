# Development Prompts: Appointment Management

**Module:** `appointments/`  
**Owner:** Sanskar Agrawal

---

## Prompt: Implement Appointment Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the Appointment Management module.

References:
- Feature spec: Documentation/feature-specs/appointments.md
- API contract: Documentation/api-contracts.md (Section 3)
- Database: appointments, departments, doctor_profiles
- Notifications: Documentation/notification-workflows.md

Backend files:
- appointments.routes.js
- appointments.controller.js
- appointments.service.js
- appointments.validation.js

Endpoints:
- GET /api/appointments (role-filtered list)
- GET /api/appointments/:id
- POST /api/appointments (patient booking)
- PUT /api/appointments/:id/reschedule
- PUT /api/appointments/:id/cancel
- PUT /api/appointments/:id/status
- GET /api/appointments/availability
- GET /api/appointments/calendar

Business rules:
- Working hours: 9 AM - 5 PM IST, 30-min slots
- No double-booking same doctor + time slot
- No booking in the past
- Status flow: REQUESTED → CONFIRMED → IN_CONSULTATION → COMPLETED / CANCELLED
- On booking: create appointment (REQUESTED), auto-create invoice, notify doctor
- On cancel: audit log APPOINTMENT_CANCELLED

Availability logic:
- Input: doctorId, date
- Output: array of 30-min slots with available: true/false
- Exclude slots with existing non-cancelled appointments

Frontend booking flow (5 steps):
1. Select department
2. Select doctor
3. Select date
4. Select time slot
5. Confirm → redirect to payment

Also implement:
- /patient/appointments — patient's appointment list
- /doctor/appointments — doctor's calendar view
- /admin/appointments — all appointments

Do NOT:
- Allow booking without checking availability
- Skip invoice creation on booking
```
