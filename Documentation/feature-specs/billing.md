# Feature Specification: Billing & Payments

**Module:** `billing/`  
**Owner:** Sanskar Agrawal (UI + logic), Shahid (Razorpay integration)  
**Version:** 1.0

---

## Overview

Handles invoice generation, Razorpay payment processing, payment verification, and payment status tracking.

---

## Features

### F-BIL-01: Auto-Generate Invoice

- Invoice created automatically when appointment is booked
- Amount based on department consultation fee
- Currency: INR
- One invoice per appointment

### F-BIL-02: View Invoices

- Patient views own invoices
- Admin views all invoices
- Shows: amount, status, appointment details, payment info

### F-BIL-03: Create Razorpay Order

- Patient initiates payment for an invoice
- Backend creates Razorpay order
- Returns order ID and amount to frontend

### F-BIL-04: Payment Verification

- Frontend sends Razorpay payment response to backend
- Backend verifies signature using Razorpay secret
- On success: payment status → `SUCCESS`, appointment → `CONFIRMED`
- On failure: payment status → `FAILED`
- Triggers audit log: `PAYMENT_SUCCESS` or `PAYMENT_FAILED`
- Triggers notification: `CONSULTATION_ASSIGNED` to doctor

### F-BIL-05: Razorpay Webhook

- Handles `payment.captured` and `payment.failed` events
- Idempotent processing (check if already processed)
- Backup verification if frontend callback fails

### F-BIL-06: Payment Status Tracking

- Statuses: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
- Patient can retry failed payments

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-BIL-01 | Patient | Pay for my appointment online | My appointment is confirmed |
| US-BIL-02 | Patient | View my payment history | I can track my expenses |
| US-BIL-03 | Admin | View all invoices and payments | I can monitor revenue |

---

## API Endpoints

See `api-contracts.md` — Section 6: Billing Module.

---

## Database Tables

- `invoices`
- `payments`

---

## Consultation Fees (Seed Data)

| Department | Fee (INR) |
|------------|-----------|
| General Medicine | 500 |
| Cardiology | 1000 |
| Orthopedics | 800 |
| Pediatrics | 600 |
| Dermatology | 700 |
| Neurology | 1200 |

---

## Payment Flow

```
1. Appointment booked → Invoice created (PENDING)
2. Patient clicks "Pay Now"
3. Frontend calls POST /api/billing/payments/create-order
4. Backend creates Razorpay order, returns orderId + keyId
5. Frontend opens Razorpay checkout modal
6. Patient completes payment
7. Frontend calls POST /api/billing/payments/verify
8. Backend verifies signature
9. Payment → SUCCESS, Appointment → CONFIRMED
10. Notifications and audit logs triggered
```

---

## Razorpay Integration (Shahid)

```javascript
// Create order
const order = await razorpay.orders.create({
  amount: amountInPaise, // INR × 100
  currency: 'INR',
  receipt: invoiceId
});

// Verify payment
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

if (expectedSignature !== razorpaySignature) {
  throw new AppError('Payment verification failed', 400);
}
```

---

## RBAC Matrix

| Endpoint | ADMIN | DOCTOR | PATIENT |
|----------|-------|--------|---------|
| GET `/billing/invoices` | Yes (all) | No | Yes (own) |
| GET `/billing/invoices/:id` | Yes | No | Yes (own) |
| POST `/billing/invoices` | Yes | No | No |
| POST `/billing/payments/create-order` | No | No | Yes |
| POST `/billing/payments/verify` | No | No | Yes |
| POST `/billing/payments/webhook` | Public* | — | — |

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Payment Checkout | `/patient/payments/:invoiceId` | PATIENT |
| Payment History | `/patient/payments` | PATIENT |
| Invoice Management | `/admin/billing` | ADMIN |

---

## Acceptance Criteria

- [ ] Invoice auto-generated on appointment booking
- [ ] Razorpay checkout opens with correct amount
- [ ] Successful payment verifies signature and confirms appointment
- [ ] Failed payment records failure and allows retry
- [ ] Webhook handles payment events idempotently
- [ ] Audit logs created for payment success/failure
- [ ] Doctor notified on payment success
- [ ] Patient cannot pay already-paid invoice
