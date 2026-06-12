# Feature Specification: Analytics Dashboard

**Module:** `analytics/`  
**Owner:** Shahid (backend), Sanskar Agrawal (frontend/D3.js)  
**Version:** 1.0

---

## Overview

Provides hospital administrators with operational metrics and visualizations using D3.js charts.

---

## Features

### F-ANA-01: Overview Dashboard

- Summary cards:
  - Total Patients
  - Total Doctors
  - Total Appointments
  - Total Revenue
  - Appointments Today
  - Pending Payments

### F-ANA-02: Revenue Trends

- Line chart: monthly revenue over last 6 months
- Data from successful payments
- D3.js line chart

### F-ANA-03: Appointment Trends

- Bar chart: appointments per month
- Breakdown by status (completed, cancelled, pending)

### F-ANA-04: Department Performance

- Bar/pie chart: appointments and revenue per department
- Shows which departments are most utilized

### F-ANA-05: Doctor Utilization (Optional)

- Table: appointments per doctor
- Helps identify workload distribution

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-ANA-01 | Admin | See hospital overview metrics | I understand current operations |
| US-ANA-02 | Admin | View revenue trends | I can track financial performance |
| US-ANA-03 | Admin | Compare department performance | I can allocate resources |

---

## API Endpoints

See `api-contracts.md` — Section 7: Analytics Module.

---

## Database Queries

Analytics backend aggregates from:

- `patient_profiles` — count
- `doctor_profiles` — count
- `appointments` — count, group by status/date/department
- `payments` — sum where status = SUCCESS, group by month

---

## D3.js Chart Specifications

### Revenue Line Chart

- X-axis: months
- Y-axis: revenue (INR)
- Tooltip on hover showing exact amount
- Responsive SVG

### Department Bar Chart

- X-axis: department names
- Y-axis: appointment count or revenue
- Color-coded bars

### Appointment Status Pie Chart

- Segments: Completed, Cancelled, Pending, In Consultation
- Legend with counts

---

## RBAC

All analytics endpoints: **ADMIN only**.

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Analytics Dashboard | `/admin/analytics` | ADMIN |

### Dashboard Layout

```
┌──────────┬──────────┬──────────┬──────────┐
│ Patients │ Doctors  │ Appts    │ Revenue  │
├──────────┴──────────┴──────────┴──────────┤
│ Revenue Trend (Line Chart)                │
├───────────────────────────────────────────┤
│ Department Performance (Bar Chart)        │
├───────────────────────────────────────────┤
│ Appointment Status (Pie Chart)            │
└───────────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Overview cards show correct counts
- [ ] Revenue chart displays last 6 months
- [ ] Department chart shows per-department data
- [ ] Charts render with D3.js (not a chart library)
- [ ] Only admin can access analytics
- [ ] Charts are responsive
- [ ] Data updates on page load (no stale cache)
