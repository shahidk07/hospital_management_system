# Development Prompts: Analytics

**Module:** `analytics/`  
**Owner:** Shahid (backend), Member 3 (frontend/D3.js)

---

## Prompt: Implement Analytics Backend

```
Context: [Paste foundation-prompt.md]

Task: Implement the Analytics backend module.

References:
- Feature spec: Documentation/feature-specs/analytics.md
- API contract: Documentation/api-contracts.md (Section 7)

Backend files:
- analytics.routes.js
- analytics.controller.js
- analytics.service.js

Endpoints (ADMIN only):
- GET /api/analytics/overview
- GET /api/analytics/revenue?period=monthly&months=6
- GET /api/analytics/appointments?period=monthly&months=6
- GET /api/analytics/departments

Queries:
- totalPatients: COUNT patient_profiles
- totalDoctors: COUNT doctor_profiles
- totalAppointments: COUNT appointments
- totalRevenue: SUM payments.amount WHERE status = SUCCESS
- appointmentsToday: COUNT WHERE scheduledAt is today
- pendingPayments: COUNT payments WHERE status = PENDING

Revenue endpoint: group successful payments by month for last N months.
Department endpoint: group appointments by department with count and revenue.

Use Prisma aggregations and raw queries where needed.
All endpoints require authenticate + authorize('ADMIN').
```

---

## Prompt: Implement Analytics Dashboard (D3.js)

```
Context: [Paste foundation-prompt.md]

Task: Implement the Analytics Dashboard frontend with D3.js.

References:
- Feature spec: Documentation/feature-specs/analytics.md
- API: GET /api/analytics/*

Page: /admin/analytics

Components:
1. OverviewCards — 6 metric cards (patients, doctors, appointments, revenue, today, pending)
2. RevenueLineChart — D3.js line chart, monthly revenue, last 6 months
3. DepartmentBarChart — D3.js bar chart, appointments per department
4. AppointmentPieChart — D3.js pie chart, status breakdown

D3.js requirements:
- Use SVG rendered by D3 (not Chart.js or Recharts)
- Responsive charts that resize with container
- Tooltips on hover
- Axis labels and legends
- Use Tailwind for card layout, D3 for chart SVG

Data fetching:
- Fetch all analytics data on page load
- Show loading spinner while fetching
- Handle errors gracefully

Do NOT:
- Use a chart library other than D3.js
- Allow non-admin access to analytics page
```
