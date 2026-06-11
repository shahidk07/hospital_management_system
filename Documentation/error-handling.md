# Error Handling

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Owner:** Shahid

This document defines the standard error handling strategy for backend and frontend.

---

## Backend Error Architecture

```
Request → Route → Controller → Service
                                  ↓ (throws AppError)
                            Error Middleware → JSON Response
```

---

## AppError Class

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}

export default AppError;
```

### Usage in Services

```javascript
import AppError from '../../utils/AppError.js';

export async function getAppointmentById(id, userId, role) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (role === 'PATIENT' && appointment.patientId !== userId) {
    throw new AppError('Access denied', 403);
  }

  return appointment;
}
```

---

## Global Error Middleware

```javascript
// middleware/error.middleware.js
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
```

---

## Error Categories

### 400 — Bad Request (Validation)

Thrown when request data is invalid.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "scheduledAt", "message": "Must be a future date" },
    { "field": "doctorId", "message": "Doctor ID is required" }
  ]
}
```

**When to use:** Missing required fields, invalid formats, business rule violations that are the client's fault.

### 401 — Unauthorized

Thrown when authentication fails.

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**When to use:** Missing token, expired JWT, invalid refresh token.

### 403 — Forbidden

Thrown when authenticated but not authorized.

```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

**When to use:** Wrong role, accessing another user's resources.

### 404 — Not Found

```json
{
  "success": false,
  "message": "Patient not found"
}
```

**When to use:** Resource does not exist.

### 409 — Conflict

```json
{
  "success": false,
  "message": "This time slot is already booked"
}
```

**When to use:** Duplicate email, double-booking, idempotent conflicts.

### 500 — Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**When to use:** Unexpected errors, database failures, external service failures not handled gracefully.

---

## Module-Specific Error Cases

### Auth

| Scenario | Status | Message |
|----------|--------|---------|
| Invalid credentials | 401 | Invalid email or password |
| Email already exists | 409 | Email already registered |
| Expired refresh token | 401 | Refresh token expired |
| Inactive account | 403 | Account is deactivated |

### Appointments

| Scenario | Status | Message |
|----------|--------|---------|
| Slot unavailable | 409 | Time slot is not available |
| Past date booking | 400 | Cannot book appointments in the past |
| Invalid status transition | 400 | Cannot change status from X to Y |
| Cancel completed appointment | 400 | Cannot cancel a completed appointment |

### Billing

| Scenario | Status | Message |
|----------|--------|---------|
| Payment verification failed | 400 | Payment verification failed |
| Invoice already paid | 409 | Invoice has already been paid |
| Invalid webhook signature | 400 | Invalid webhook signature |

### EMR

| Scenario | Status | Message |
|----------|--------|---------|
| File too large | 400 | File size exceeds 10MB limit |
| Invalid file type | 400 | File type not supported |
| Cloudinary upload failed | 500 | Failed to upload file |

### AI

| Scenario | Status | Message |
|----------|--------|---------|
| Gemini API timeout | 504 | AI service timed out. Please try again. |
| Gemini API error | 502 | AI service unavailable |
| Empty symptoms input | 400 | Please provide at least one symptom |

---

## Async Error Handling in Controllers

Use `try/catch` with `next(error)` or an async wrapper:

```javascript
// Option 1: try/catch
export async function createAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.create(req.body, req.user);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

// Option 2: async wrapper (recommended)
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.create(req.body, req.user);
  res.status(201).json({ success: true, data: appointment });
});
```

---

## Prisma Error Handling

Map common Prisma errors in service layer:

```javascript
try {
  await prisma.user.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    throw new AppError('Email already exists', 409);
  }
  if (error.code === 'P2025') {
    throw new AppError('Record not found', 404);
  }
  throw error; // re-throw unexpected errors
}
```

| Prisma Code | Meaning | HTTP Status |
|-------------|---------|-------------|
| P2002 | Unique constraint violation | 409 |
| P2025 | Record not found | 404 |
| P2003 | Foreign key constraint | 400 |

---

## External Service Errors

### Gemini API

```javascript
try {
  const result = await geminiModel.generateContent(prompt);
  return parseResponse(result);
} catch (error) {
  if (error.message?.includes('timeout')) {
    throw new AppError('AI service timed out. Please try again.', 504);
  }
  throw new AppError('AI service unavailable', 502);
}
```

### Razorpay

```javascript
try {
  const order = await razorpay.orders.create(options);
  return order;
} catch (error) {
  throw new AppError('Payment service unavailable', 502);
}
```

### Cloudinary

```javascript
try {
  const result = await cloudinary.uploader.upload(filePath, options);
  return result;
} catch (error) {
  throw new AppError('Failed to upload file', 500);
}
```

---

## Frontend Error Handling

### Axios Interceptor

```javascript
// api/axios.js
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh, then redirect to login
    }
    return Promise.reject(error);
  }
);
```

### Component Error Display

```jsx
const [error, setError] = useState(null);

try {
  await bookAppointment(data);
} catch (err) {
  const message = err.response?.data?.message || 'Something went wrong';
  setError(message);
}

{error && (
  <div className="bg-red-50 text-red-700 p-3 rounded">
    {error}
  </div>
)}
```

### Field-Level Validation Errors

```jsx
{errors.map((e) => (
  <p key={e.field} className="text-red-500 text-sm">
    {e.message}
  </p>
))}
```

---

## Logging

| Level | When |
|-------|------|
| `error` | Unexpected 500 errors, external service failures |
| `warn` | Repeated failed login attempts, rate limit hits |
| `info` | Successful payments, appointment bookings |
| `debug` | Development only — request/response details |

**Never log:** passwords, JWT tokens, refresh tokens, Razorpay signatures, patient PII in production.

---

## Error Response Checklist

Every error response must include:

- [ ] `success: false`
- [ ] Human-readable `message`
- [ ] Appropriate HTTP status code
- [ ] `errors` array for validation failures
- [ ] No stack trace in production
- [ ] No sensitive data in response body
