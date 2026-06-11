# Contributing Guide

**Project:** AI-Powered Hospital Management System  
**Team:** Shahid (Lead), Member 2, Member 3

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable demo-ready code — do not push directly |
| `develop` | Team integration — merge feature PRs here |
| `feature/*` | Your work on one task — delete after merge |

---

## Workflow (every task)

```bash
# 1. Start from latest develop
git checkout develop
git pull origin develop

# 2. Create your feature branch
git checkout -b feature/<module>-<description>

# 3. Work, commit, push
git add .
git commit -m "feat(module): description"
git push -u origin feature/<module>-<description>

# 4. Open Pull Request on GitHub → merge into develop
# 5. Delete feature branch after merge
```

---

## Module Ownership

| Owner | Modules | Folders |
|-------|---------|---------|
| **Shahid** | auth, ai, audit-logs, analytics (backend) | `backend/src/modules/auth/`, `ai/`, `audit-logs/`, `analytics/` |
| **Member 2** | consultations, emr | `backend/src/modules/consultations/`, `emr/`, `frontend/src/pages/doctor/` |
| **Member 3** | patients, appointments, billing, notifications, analytics (UI) | `backend/src/modules/patients/`, `appointments/`, `billing/`, `notifications/`, `frontend/src/pages/patient/` |

**Do not edit another person's module without discussion.**

**Shahid owns (shared files — ask before editing):**
- `backend/prisma/schema.prisma`
- `backend/src/middleware/`
- `backend/src/app.js`
- `Documentation/api-contracts.md`
- `Documentation/database-schema.md`

---

## Commit Message Format

```
feat(auth): add JWT login endpoint
fix(appointments): prevent double-booking
docs: update API contracts for billing
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`

---

## Pull Request Rules

1. One module or feature per PR
2. Link to the relevant feature spec in `Documentation/feature-specs/`
3. Include how to test your changes
4. Target branch: `develop` (not `main`)
5. Shahid reviews changes to shared files and Prisma schema

---

## Before You Code

1. Read `Documentation/prompts/foundation-prompt.md`
2. Read your module prompt in `Documentation/prompts/`
3. Read your feature spec in `Documentation/feature-specs/`
4. Check API contract in `Documentation/api-contracts.md`

---

## Environment Setup

```bash
git clone https://github.com/shahidk07/hospital_management_system.git
cd hospital_management_system
git checkout develop

cp backend/.env.example backend/.env    # fill in values
cp frontend/.env.example frontend/.env    # fill in values

cd backend && npm install
cd ../frontend && npm install
```

**Never commit `.env` files.**

---

## Escalation

- Module decisions → module owner
- Cross-module conflicts → Shahid
- Stack or architecture changes → team approval required
