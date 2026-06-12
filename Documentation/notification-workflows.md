# Notification Workflows

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Owner:** Sanskar Agrawal

This document defines when notifications are created, who receives them, and the trigger points in the system.

---

## Notification Types

| Type | Recipient | Trigger |
|------|-----------|---------|
| `APPOINTMENT_REMINDER` | PATIENT | 24 hours before scheduled appointment |
| `REPORT_AVAILABLE` | PATIENT | Medical record uploaded (lab report, X-ray, MRI) |
| `PRESCRIPTION_READY` | PATIENT | Doctor creates prescription |
| `NEW_APPOINTMENT` | DOCTOR | Patient books appointment |
| `CONSULTATION_ASSIGNED` | DOCTOR | Appointment confirmed and paid |

---

## Workflow Diagrams

### Appointment Booking Flow

```
Patient books appointment
  → Notification: NEW_APPOINTMENT → Doctor

Patient pays invoice
  → Appointment status: CONFIRMED
  → Notification: CONSULTATION_ASSIGNED → Doctor

24 hours before appointment
  → Notification: APPOINTMENT_REMINDER → Patient
```

### Consultation Completion Flow

```
Doctor creates prescription
  → Notification: PRESCRIPTION_READY → Patient

Doctor uploads lab report
  → Notification: REPORT_AVAILABLE → Patient
```

---

## Trigger Implementation

### 1. NEW_APPOINTMENT

**Trigger:** `appointments.service.js` → after `createAppointment()`

```javascript
await notificationService.create({
  userId: doctor.userId,
  type: 'NEW_APPOINTMENT',
  title: 'New Appointment',
  message: `${patient.firstName} ${patient.lastName} booked an appointment on ${formattedDate}`,
  metadata: { appointmentId: appointment.id, link: `/doctor/appointments/${appointment.id}` }
});
```

### 2. CONSULTATION_ASSIGNED

**Trigger:** `billing.service.js` → after payment verification success

```javascript
await notificationService.create({
  userId: doctor.userId,
  type: 'CONSULTATION_ASSIGNED',
  title: 'Consultation Assigned',
  message: `Appointment with ${patient.firstName} on ${formattedDate} is confirmed`,
  metadata: { appointmentId: appointment.id }
});
```

### 3. APPOINTMENT_REMINDER

**Trigger:** Scheduled job or check on app load

For portfolio scope, implement as a simple cron or check-on-request:

```javascript
// Run daily at 8:00 AM IST
// Find appointments scheduled for tomorrow with status CONFIRMED
// Send APPOINTMENT_REMINDER to each patient
```

**Alternative (simpler):** Check on patient dashboard load — if appointment is within 24 hours and no reminder sent, create notification.

### 4. PRESCRIPTION_READY

**Trigger:** `consultations.service.js` → after `createPrescription()`

```javascript
await notificationService.create({
  userId: patient.userId,
  type: 'PRESCRIPTION_READY',
  title: 'Prescription Ready',
  message: 'Your prescription from today\'s consultation is ready to view',
  metadata: { prescriptionId: prescription.id, link: `/patient/prescriptions/${prescription.id}` }
});
```

### 5. REPORT_AVAILABLE

**Trigger:** `emr.service.js` → after successful file upload (type: LAB_REPORT, XRAY, MRI)

```javascript
await notificationService.create({
  userId: patient.userId,
  type: 'REPORT_AVAILABLE',
  title: 'Report Available',
  message: `Your ${record.type} report "${record.title}" is now available`,
  metadata: { recordId: record.id, link: `/patient/records/${record.id}` }
});
```

---

## Notification Record Structure

```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "NEW_APPOINTMENT",
  "title": "New Appointment",
  "message": "John Doe booked an appointment on Jun 15, 2026 at 10:00 AM",
  "isRead": false,
  "metadata": {
    "appointmentId": "uuid",
    "link": "/doctor/appointments/uuid"
  },
  "createdAt": "2026-06-10T14:30:00Z"
}
```

---

## UI Requirements

### Notification Bell (All Roles)

- Bell icon in navbar with unread count badge
- Dropdown showing latest 5 notifications
- "Mark all as read" action
- Link to full notification page

### Notification Page

- Paginated list of all notifications
- Filter: All / Unread
- Click notification → mark as read + navigate to `metadata.link`
- Visual distinction between read and unread

---

## Email Notifications (Optional)

Email is **not required** for v1. If implemented later:

| Type | Email Template |
|------|----------------|
| APPOINTMENT_REMINDER | "Reminder: Your appointment is tomorrow at {time}" |
| PRESCRIPTION_READY | "Your prescription is ready to view" |
| REPORT_AVAILABLE | "A new medical report is available" |

Use a service like SendGrid or Nodemailer. Not in frozen scope.

---

## API Endpoints

See `api-contracts.md` — Notifications Module.

---

## Polling vs WebSocket

For portfolio scope, use **polling**:

- Frontend polls `GET /api/notifications/unread-count` every 60 seconds
- Or fetch on navigation events

WebSocket/SSE is out of scope.

---

## Error Handling

- Notification creation failure must NOT block the primary operation
- Wrap notification calls in try/catch; log errors silently

```javascript
try {
  await notificationService.create({ ... });
} catch (error) {
  console.error('Failed to create notification:', error.message);
  // Do not throw — appointment creation should still succeed
}
```
