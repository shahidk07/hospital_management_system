# AI-Powered Hospital Management System (Team Edition v4)

## Project Overview

A product-style AI-Powered Hospital Management System designed to manage:

- Patients
- Doctors
- Appointments
- Consultations
- Medical Records
- Billing & Payments
- Analytics
- AI-Assisted Healthcare Workflows

The system focuses on operational efficiency, digital healthcare records, and AI-assisted decision support.

---

# Final Technology Stack

## Frontend
- React
- Tailwind CSS
- D3.js

## Backend
- Node.js
- Express.js

## Database
- PostgreSQL (Neon)

## ORM
- Prisma

## Authentication
- JWT
- Refresh Tokens
- Session Management
- bcrypt

## AI
- Gemini API

## Payments
- Razorpay (Test Mode)

## File Storage
- Cloudinary

## Deployment
- Render

## Version Control
- Git
- GitHub

---

# User Roles

## Admin
- Create Doctor Accounts
- Manage Patients
- Monitor Appointments
- View Analytics
- Review Audit Logs

## Doctor
- View Assigned Patients
- View Medical History
- Create Diagnosis
- Generate Prescriptions
- Manage Consultations

## Patient
- Register
- Book Appointments
- View Prescriptions
- Download Reports
- Make Payments
- Use AI Features

---

# Core Workflow

Patient Registration
→ Appointment Booking
→ Payment
→ Doctor Consultation
→ Prescription Generation
→ Medical Record Storage
→ AI Assistance
→ Analytics & Monitoring

---

# Modules

## Module 1: Authentication & RBAC

Features:
- Registration
- Login
- Logout
- JWT Authentication
- Refresh Tokens
- Session Management
- Role-Based Access Control

---

## Module 2: Patient Management

Features:
- Create Patient Profile
- Update Patient Information
- View Patient Profile
- Manage Medical History

---

## Module 3: Appointment Management

Features:
- Department Selection
- Doctor Selection
- Time Slot Selection
- Doctor Availability Check
- Calendar View
- Rescheduling
- Cancellation

Status Flow:

Requested
→ Confirmed
→ In Consultation
→ Completed
→ Cancelled

---

## Module 4: Doctor Consultation

Features:
- View Patient History
- View Previous Reports
- Create Diagnosis
- Create Treatment Plan
- Generate Prescription

---

## Module 5: Electronic Medical Records (EMR)

Stores:
- Prescriptions
- Lab Reports
- X-Rays
- MRI Reports

Features:
- Upload
- View
- Download
- Search
- Categorize

---

## Module 6: Billing & Payments

Features:
- Generate Invoice
- Payment Tracking
- Payment Confirmation

Gateway:
- Razorpay

---

## Module 7: Analytics Dashboard

Metrics:
- Total Patients
- Total Doctors
- Total Appointments
- Revenue

Charts:
- Revenue Trends
- Patient Volume Trends
- Department Performance
- Doctor Utilization

---

## Module 8: AI Healthcare Assistant

### Symptom Analyzer
Patient enters symptoms.

AI returns:
- Possible Conditions
- Recommended Department
- Urgency Level

### Medical Record Summarizer
Doctor clicks:
- Summarize History

AI summarizes:
- Diseases
- Allergies
- Surgeries
- Medications

### Prescription Explainer
Patient clicks:
- Explain Prescription

AI explains medicine in simple language.

---

## Module 9: Notifications

Patient:
- Appointment Reminder
- Report Available
- Prescription Ready

Doctor:
- New Appointment

Implementation:
- In-App Notifications

---

## Module 10: Audit Logs

Tracks:
- Login Events
- Doctor Creation
- Patient Creation
- Appointment Creation
- Prescription Creation
- Payment Success

Admin Can:
- View Activity Feed
- Review Audit Logs

---

# Backend Architecture

backend/src/modules/

- auth/
- patients/
- appointments/
- consultations/
- emr/
- billing/
- analytics/
- notifications/
- audit-logs/
- ai/

---

# Team Structure

## Shahid (Technical Lead) — 50%

Responsibilities:

- Architecture Design
- Database Schema Design
- PostgreSQL & Prisma
- Authentication & RBAC
- AI Healthcare Assistant
- Razorpay Integration
- Audit Logs
- Deployment
- GitHub Management
- Final Integration
- Code Reviews

Modules:

- auth/
- ai/
- audit-logs/

Cross-Cutting Responsibilities:

- JWT
- Refresh Tokens
- Database Relationships
- Cloudinary Integration
- API Standards

---

## Dakshesh Jain (Clinical Operations) — 25%

Responsibilities:

- Doctor Consultation Module
- EMR Module
- Prescription Management
- Medical Record Screens

Modules:

- consultations/
- emr/

---

## Sanskar Agrawal (Patient Operations) — 25%

Responsibilities:

- Patient Management
- Appointment Management
- Billing UI
- Notifications UI
- Analytics UI

Modules:

- patients/
- appointments/
- billing/
- notifications/

---

# Team Development Rules

## Rule 1

Shahid owns:

- Database Design
- Folder Structure
- API Contracts

before development starts.

---

## Rule 2

Nobody modifies another person's module without discussion.

---

## Rule 3

AI remains an independent module.

Example:

appointments/
      ↓
calls
      ↓
POST /api/ai/analyze-symptoms

AI logic remains inside:

ai/

---

## Rule 4

Each member owns their module end-to-end.

---

# Deployment Architecture

React + Tailwind + D3
        |
      Render
        |
Node.js + Express
        |
      Render
        |
     Prisma
        |
PostgreSQL (Neon)

External Services:

- Gemini API
- Razorpay
- Cloudinary

---

# Out of Scope

Not Included:

- Pharmacy Management
- Laboratory Management
- Emergency Management
- Bed Allocation
- Insurance Claims
- Multi-Hospital Support
- AI Appointment Assistant
- AI Operations Dashboard

---

# Success Criteria

Patient can:

Register
→ Book Appointment
→ Pay Online
→ Attend Consultation
→ Receive Prescription
→ Access Medical Records
→ Use AI Features

Admin can:

- Monitor Hospital Operations
- View Analytics
- Review Audit Logs

Doctor can:

- Manage Consultations
- Access Patient History
- Generate Prescriptions
- Use AI Summarization
