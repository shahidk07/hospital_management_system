# Development Prompts: Notifications

**Module:** `notifications/`  
**Owner:** Sanskar Agrawal

---

## Prompt: Implement Notification Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the Notifications module.

References:
- Feature spec: Documentation/feature-specs/notifications.md
- API contract: Documentation/api-contracts.md (Section 8)
- Workflows: Documentation/notification-workflows.md
- Database: notifications

Backend files:
- notifications.routes.js
- notifications.controller.js
- notifications.service.js

API Endpoints:
- GET /api/notifications (paginated, filter unreadOnly)
- GET /api/notifications/unread-count
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all

Internal service method (used by other modules):
notificationService.create({ userId, type, title, message, metadata })

Notification creation must NOT block primary operations — wrap in try/catch.

Frontend components:
1. NotificationBell — navbar icon with unread badge, dropdown with latest 5
2. NotificationPage — /notifications — full paginated list
3. NotificationContext — poll unread count every 60 seconds

UI behavior:
- Unread notifications: bold/highlighted
- Click notification → mark as read + navigate to metadata.link
- "Mark all as read" button

Do NOT:
- Implement WebSocket (use polling)
- Block appointment/payment operations if notification fails
- Send email notifications (in-app only for v1)
```

---

## Prompt: Appointment Reminder Logic

```
Task: Implement appointment reminder notifications.

Reference: Documentation/notification-workflows.md

Approach (simple, for portfolio):
On patient dashboard load, check for appointments within next 24 hours
where status is CONFIRMED and no APPOINTMENT_REMINDER already sent.

If found, create notification:
{
  type: 'APPOINTMENT_REMINDER',
  title: 'Appointment Reminder',
  message: 'Your appointment with Dr. {name} is tomorrow at {time}',
  metadata: { appointmentId, link: '/patient/appointments/{id}' }
}

Alternative: simple cron job running daily at 8 AM IST.
Choose whichever is simpler to implement.
```
