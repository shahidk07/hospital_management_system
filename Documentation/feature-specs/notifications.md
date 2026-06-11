# Feature Specification: Notifications

**Module:** `notifications/`  
**Owner:** Member 3  
**Version:** 1.0

---

## Overview

In-app notification system for patients and doctors. See `notification-workflows.md` for trigger details.

---

## Features

### F-NOT-01: List Notifications

- Paginated list for authenticated user
- Filter: all or unread only
- Sorted by createdAt descending

### F-NOT-02: Unread Count

- Returns count of unread notifications
- Used for navbar badge

### F-NOT-03: Mark as Read

- Mark single notification as read
- Mark all notifications as read

### F-NOT-04: Notification Creation (Internal)

- Called by other modules via notification service
- Not a public API endpoint
- See `notification-workflows.md` for triggers

---

## Notification Types

| Type | Recipient | Trigger Module |
|------|-----------|----------------|
| `APPOINTMENT_REMINDER` | PATIENT | appointments |
| `REPORT_AVAILABLE` | PATIENT | emr |
| `PRESCRIPTION_READY` | PATIENT | consultations |
| `NEW_APPOINTMENT` | DOCTOR | appointments |
| `CONSULTATION_ASSIGNED` | DOCTOR | billing |

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-NOT-01 | Patient | See appointment reminders | I don't miss my appointments |
| US-NOT-02 | Doctor | Get notified of new appointments | I can prepare for patients |
| US-NOT-03 | User | See unread notification count | I know when something needs attention |

---

## API Endpoints

See `api-contracts.md` — Section 8: Notifications Module.

---

## Database Tables

- `notifications`

---

## UI Components

### NotificationBell

- Located in navbar for all authenticated users
- Shows unread count badge
- Dropdown with latest 5 notifications
- "View All" link to notification page

### NotificationPage

- Full paginated list
- Read/unread visual distinction
- Click to mark read and navigate via `metadata.link`

---

## Polling Strategy

- Poll `GET /api/notifications/unread-count` every 60 seconds
- Refresh on route navigation

---

## Acceptance Criteria

- [ ] Notifications created by trigger events in other modules
- [ ] Unread count displays correctly in navbar
- [ ] Mark as read works for single and all
- [ ] Clicking notification navigates to relevant page
- [ ] Notification creation failure does not block primary operations
- [ ] Pagination works on notification list
