# Coding Standards

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Owner:** Shahid

All team members must follow these standards for consistency and maintainability.

---

## General Principles

1. **Simplicity over abstraction** — use routes → controllers → services; avoid unnecessary patterns
2. **Documentation first** — read feature specs and API contracts before coding
3. **Match existing code** — follow conventions in the file you are editing
4. **Small, focused changes** — one feature per PR when possible

---

## JavaScript / Node.js (Backend)

### Style

- Use ES modules (`import`/`export`) or CommonJS consistently per project setup
- Use `async/await`; avoid callback-style code
- Use `const` by default; `let` only when reassignment is needed
- No `var`

### File Organization

```javascript
// 1. Imports
import express from 'express';
import { createAppointment } from './appointments.service.js';

// 2. Router setup
const router = express.Router();

// 3. Routes
router.post('/', authenticate, authorize('PATIENT'), createAppointmentController);

// 4. Export
export default router;
```

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Files | dot notation | `auth.service.js` |
| Functions | camelCase | `getPatientById` |
| Classes | PascalCase | `AppError` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| Route params | camelCase in code | `req.params.appointmentId` |

### Error Handling

- Throw `AppError` for expected failures
- Let the global error middleware handle formatting
- Never expose stack traces in production responses

```javascript
// Good
throw new AppError('Appointment slot not available', 409);

// Bad
res.status(409).json({ error: 'Slot taken' }); // in service layer
```

### Prisma Usage

- All Prisma calls live in service files only
- Use transactions for multi-table operations
- Select only needed fields for list endpoints

```javascript
// Good — service layer
const patient = await prisma.patientProfile.findUnique({
  where: { id },
  select: { id: true, firstName: true, lastName: true }
});

// Bad — controller layer
const patient = await prisma.patientProfile.findUnique({ where: { id } });
```

---

## React (Frontend)

### Component Structure

```jsx
// 1. Imports
import { useState, useEffect } from 'react';
import { getAppointments } from '../api/appointments.api';

// 2. Component
export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    // ...
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {/* JSX */}
    </div>
  );
}
```

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AppointmentCard.jsx` |
| Hooks | camelCase, `use` prefix | `useAuth.js` |
| API files | camelCase | `appointments.api.js` |
| CSS classes | Tailwind utilities | `className="flex gap-4"` |

### State Management

- Use React Context for auth and global notification state
- Use local state for component-specific data
- No Redux or external state libraries

### API Calls

- All HTTP calls go through `src/api/` files
- Never call `axios` directly from components
- Handle loading and error states in UI

---

## API Response Handling

Always use the standard format from `api-contracts.md`:

```javascript
// Controller
export async function getPatients(req, res, next) {
  try {
    const result = await patientService.getPatients(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
```

---

## Validation

- Validate all request bodies at the route/controller level
- Use a validation library (e.g., Zod or Joi) consistently
- Return 400 with field-level errors when validation fails

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Security Rules

1. Never log passwords, tokens, or payment signatures
2. Never commit secrets to git
3. Always verify JWT before accessing protected resources
4. Always check role authorization after authentication
5. Sanitize user input before database queries (Prisma handles parameterization)
6. Validate Razorpay webhook signatures before processing

---

## Git Commit Messages

Format: `<type>: <description>`

Types:

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `refactor` — code change without feature/fix
- `test` — adding tests
- `chore` — tooling, dependencies

Examples:

```
feat: add appointment booking endpoint
fix: prevent double-booking same time slot
docs: update API contracts for billing module
```

---

## Pull Request Guidelines

1. One module focus per PR when possible
2. Link to relevant feature spec
3. Include test steps in PR description
4. No unrelated formatting changes
5. Shahid reviews cross-cutting changes; module owner reviews module PRs

---

## Comments

- Write self-documenting code with clear names
- Add comments only for non-obvious business logic
- No commented-out code in merged PRs

```javascript
// Good — explains business rule
// Appointments can only be rescheduled if status is REQUESTED or CONFIRMED
if (!['REQUESTED', 'CONFIRMED'].includes(appointment.status)) {
  throw new AppError('Cannot reschedule this appointment', 400);
}

// Bad — states the obvious
// Get patient by ID
const patient = await getPatientById(id);
```

---

## Environment Variables

- Access via `process.env` in backend
- Access via `import.meta.env` in frontend (Vite)
- Provide defaults only for non-sensitive dev values
- Document all required vars in `.env.example`

---

## Testing (When Applicable)

- Test service layer business logic
- Test API endpoints for auth and RBAC
- Mock external services (Gemini, Razorpay, Cloudinary) in tests
- No tests required for simple CRUD unless they contain business rules

---

## Forbidden Patterns

- Business logic in route handlers
- Direct Prisma calls from controllers
- Gemini SDK imports outside `ai/` module
- Storing files as BLOB in PostgreSQL
- Suggesting alternative frameworks or databases
- Microservices or message queue patterns
