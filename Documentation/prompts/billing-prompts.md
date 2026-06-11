# Development Prompts: Billing & Payments

**Module:** `billing/`  
**Owner:** Member 3 (UI), Shahid (Razorpay)

---

## Prompt: Implement Billing Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the Billing & Payments module.

References:
- Feature spec: Documentation/feature-specs/billing.md
- API contract: Documentation/api-contracts.md (Section 6)
- Database: invoices, payments
- Notifications: CONSULTATION_ASSIGNED on payment success
- Audit: PAYMENT_SUCCESS, PAYMENT_FAILED

Backend files:
- billing.routes.js
- billing.controller.js
- billing.service.js
- config/razorpay.js

Endpoints:
- GET /api/billing/invoices
- GET /api/billing/invoices/:id
- POST /api/billing/invoices (admin manual create)
- POST /api/billing/payments/create-order
- POST /api/billing/payments/verify
- POST /api/billing/payments/webhook

Invoice auto-creation:
- Called from appointments.service.js after booking
- Amount based on department fee (see feature spec fee table)
- One invoice per appointment

Razorpay flow:
1. create-order: create Razorpay order, store Payment record (PENDING)
2. verify: validate signature, update Payment (SUCCESS), appointment (CONFIRMED)
3. webhook: backup handler for payment.captured / payment.failed

Signature verification:
crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex')

Frontend:
- /patient/payments/:invoiceId — checkout page with Razorpay modal
- /patient/payments — payment history
- /admin/billing — invoice management

Use Razorpay checkout.js on frontend with VITE_RAZORPAY_KEY_ID.

Do NOT:
- Confirm appointment before payment verification
- Process webhook without signature validation
- Allow paying already-paid invoices
```

---

## Prompt: Razorpay Integration (Shahid)

```
Task: Set up Razorpay configuration and payment verification.

Files:
- config/razorpay.js — Razorpay instance
- billing.service.js — order creation and verification

Environment variables:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET (optional)

Implement:
1. razorpay.orders.create() with amount in paise (INR × 100)
2. Signature verification on payment callback
3. Webhook handler with idempotency check
4. Audit logging on success/failure
5. Notification to doctor on success

Test with Razorpay test mode cards:
- Card: 4111 1111 1111 1111
- Any future expiry, any CVV
```
