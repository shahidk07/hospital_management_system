# Development Prompts: Audit Logs

**Module:** `audit-logs/`  
**Owner:** Shahid

---

## Prompt: Implement Audit Log Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the Audit Logs module.

References:
- Feature spec: Documentation/feature-specs/audit-logs.md
- Spec: Documentation/audit-log-spec.md
- API contract: Documentation/api-contracts.md (Section 9)
- Database: audit_logs

Backend files:
- audit-logs.routes.js
- audit-logs.controller.js
- audit-logs.service.js
- utils/auditLogger.js (helper for other modules)

API Endpoints (ADMIN only):
- GET /api/audit-logs (paginated, filters: action, from, to, userId)
- GET /api/audit-logs/:id

Internal helper (utils/auditLogger.js):
export async function logAudit({ userId, action, entityType, entityId, metadata, req }) {
  await auditLogService.create({
    userId,
    action,
    entityType,
    entityId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    metadata
  });
}

Tracked actions:
LOGIN, LOGOUT, PATIENT_CREATED, DOCTOR_CREATED,
APPOINTMENT_CREATED, APPOINTMENT_CANCELLED,
PRESCRIPTION_CREATED, PAYMENT_SUCCESS, PAYMENT_FAILED

Rules:
- Append-only (no update/delete endpoints)
- Never log passwords, tokens, or full medical data
- userId can be null for system events

Frontend:
- /admin/audit-logs — paginated table with filters
- /admin/dashboard — activity feed widget (latest 10 events)

Activity feed format:
[{ action, userEmail, entityType, timestamp }]

Do NOT:
- Allow non-admin access
- Log sensitive data (passwords, tokens, signatures)
- Create update or delete endpoints for audit logs
```

---

## Prompt: Integrate Audit Logging Across Modules

```
Task: Add audit log calls to all relevant modules.

Import logAudit from utils/auditLogger.js in each service file.

Integration points:
| Module | Service method | Action |
|--------|---------------|--------|
| auth | login() | LOGIN |
| auth | logout() | LOGOUT |
| auth | register() | PATIENT_CREATED |
| auth | createDoctor() | DOCTOR_CREATED |
| appointments | create() | APPOINTMENT_CREATED |
| appointments | cancel() | APPOINTMENT_CANCELLED |
| consultations | createPrescription() | PRESCRIPTION_CREATED |
| billing | verifyPayment() success | PAYMENT_SUCCESS |
| billing | verifyPayment() failure | PAYMENT_FAILED |

Each call should include relevant metadata per audit-log-spec.md.
Audit failure should not block the primary operation (try/catch).
```
