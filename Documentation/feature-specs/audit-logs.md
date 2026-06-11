# Feature Specification: Audit Logs

**Module:** `audit-logs/`  
**Owner:** Shahid  
**Version:** 1.0

---

## Overview

Immutable activity log for admin review. See `audit-log-spec.md` for detailed event specifications.

---

## Features

### F-AUD-01: Create Audit Log (Internal)

- Service called by other modules after key events
- Append-only — no update or delete

### F-AUD-02: List Audit Logs

- Admin-only, paginated
- Filters: action type, date range, userId

### F-AUD-03: View Audit Log Detail

- Admin views single log entry with full metadata

### F-AUD-04: Activity Feed (Dashboard Widget)

- Latest 10 events on admin dashboard
- Compact format: action, user, timestamp

---

## Tracked Events

| Action | Source Module |
|--------|---------------|
| LOGIN | auth |
| LOGOUT | auth |
| PATIENT_CREATED | auth, patients |
| DOCTOR_CREATED | auth |
| APPOINTMENT_CREATED | appointments |
| APPOINTMENT_CANCELLED | appointments |
| PRESCRIPTION_CREATED | consultations |
| PAYMENT_SUCCESS | billing |
| PAYMENT_FAILED | billing |

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-AUD-01 | Admin | View system activity | I can monitor operations |
| US-AUD-02 | Admin | Filter audit logs | I can investigate specific events |

---

## API Endpoints

See `api-contracts.md` — Section 9: Audit Logs Module.

---

## Database Tables

- `audit_logs`

---

## RBAC

All audit log endpoints: **ADMIN only**.

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Audit Logs | `/admin/audit-logs` | ADMIN |
| Activity Feed | `/admin/dashboard` (widget) | ADMIN |

---

## Acceptance Criteria

- [ ] All 9 event types are logged correctly
- [ ] No sensitive data in log metadata
- [ ] Admin can list and filter audit logs
- [ ] Activity feed shows on admin dashboard
- [ ] Logs are append-only (no edit/delete API)
- [ ] Only admin can access audit endpoints
