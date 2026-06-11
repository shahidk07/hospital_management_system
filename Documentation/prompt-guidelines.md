# Prompt Guidelines

**Project:** AI-Powered Hospital Management System  
**Version:** 1.0  
**Owner:** Shahid

This document defines how to write and use prompts for AI-assisted development and for the Gemini API integration.

---

## Two Types of Prompts

| Type | Location | Purpose |
|------|----------|---------|
| **Development prompts** | `Documentation/prompts/` | Guide Cursor/AI agents during code generation |
| **Runtime prompts** | `Documentation/prompts/ai-prompts.md` | Sent to Gemini API at runtime |

---

## Development Prompt Rules

When using Cursor or other AI coding assistants to build modules:

### 1. Always Reference Foundation

Start every development session with `prompts/foundation-prompt.md`. It contains frozen project constraints.

### 2. Use Module-Specific Prompts

Each module has a dedicated prompt file in `prompts/`. Use the relevant file for the module being built.

### 3. Follow Documentation Order

```
SRS.md → feature-specs/<module>.md → database-schema.md → api-contracts.md → implementation
```

Never skip to implementation without reading the spec.

### 4. Include in Every Prompt

- Module name and owner
- Relevant API endpoints from `api-contracts.md`
- Database tables from `database-schema.md`
- RBAC requirements (which roles can access what)
- Error cases from `error-handling.md`

### 5. Forbidden in Development Prompts

- Suggesting alternative frameworks (NestJS, Django, etc.)
- Suggesting MongoDB or MySQL
- Adding new AI features beyond the three approved
- Microservices or event-driven patterns
- Storing files in PostgreSQL

---

## Runtime Prompt Rules (Gemini API)

### Model Selection

- Use `gemini-1.5-flash` for cost efficiency
- Temperature: 0.3 (factual, consistent responses)

### Prompt Structure

Every runtime prompt must include:

1. **System context** — role and constraints
2. **Input data** — structured patient/symptom/prescription data
3. **Output format** — exact JSON schema expected
4. **Disclaimer** — "This is not a medical diagnosis"

### Safety Constraints

All AI prompts must include:

```
IMPORTANT: You are an informational assistant, not a medical professional.
- Do not provide definitive diagnoses
- Do not recommend specific medications
- Always recommend consulting a healthcare professional
- Use cautious language ("possible conditions", "may suggest")
```

### Response Parsing

- Always request JSON output from Gemini
- Parse and validate response before sending to client
- Handle malformed responses gracefully (return 502 with retry message)

---

## Prompt File Index

| File | Used For |
|------|----------|
| `foundation-prompt.md` | Base context for all development |
| `auth-prompts.md` | Auth module development |
| `patient-prompts.md` | Patient module development |
| `appointment-prompts.md` | Appointment module development |
| `consultation-prompts.md` | Consultation module development |
| `emr-prompts.md` | EMR module development |
| `billing-prompts.md` | Billing module development |
| `analytics-prompts.md` | Analytics module development |
| `notification-prompts.md` | Notification module development |
| `audit-log-prompts.md` | Audit log module development |
| `ai-prompts.md` | Gemini runtime prompts |
| `integration-prompts.md` | Final integration and cross-module work |

---

## Example Development Prompt Template

```
Context: [Paste foundation-prompt.md summary]

Task: Implement [feature] for the [module] module.

References:
- Feature spec: Documentation/feature-specs/[module].md
- API contract: Documentation/api-contracts.md (section [N])
- Database: Documentation/database-schema.md (tables: [list])

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]
- RBAC: [roles allowed]
- Error cases: [list]

Do NOT:
- [Forbidden item 1]
- [Forbidden item 2]

Follow coding-standards.md and project-structure-guide.md.
```

---

## Versioning

When prompts change:

1. Update the prompt file
2. Note the change in the file's version header
3. Notify affected module owners if development is in progress

---

## Quality Checklist

Before using a prompt for development:

- [ ] References correct module and owner
- [ ] Includes RBAC constraints
- [ ] Lists specific API endpoints
- [ ] Mentions error handling requirements
- [ ] Does not suggest forbidden technologies
- [ ] Aligns with frozen project context

Before deploying a runtime prompt:

- [ ] Includes medical disclaimer
- [ ] Requests structured JSON output
- [ ] Tested with sample inputs
- [ ] Handles empty/invalid input gracefully
- [ ] Response parsing validated
