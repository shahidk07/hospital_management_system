# Feature Specification: AI Module

**Module:** `ai/`  
**Owner:** Shahid  
**Version:** 1.0

---

## Overview

Independent module providing three AI features via Gemini API. Other modules call AI endpoints via HTTP — no direct Gemini SDK imports outside `ai/`.

---

## Approved AI Features

### F-AI-01: Symptom Analyzer

**User:** Patient  
**Endpoint:** `POST /api/ai/analyze-symptoms`

**Input:**
- Symptoms (array of strings)
- Duration (optional)
- Additional info (optional)

**Output:**
- Possible conditions (array, informational only)
- Recommended department
- Urgency level: LOW | MEDIUM | HIGH | EMERGENCY
- Disclaimer

**Purpose:** Help patients decide which department to visit. **Not a diagnosis.**

---

### F-AI-02: Medical Record Summarizer

**User:** Doctor  
**Endpoint:** `POST /api/ai/summarize-records`

**Input:**
- Patient ID

**Output:**
- Short medical summary (paragraph)
- Key points: diseases, allergies, surgeries, current medications

**Purpose:** Help doctors quickly understand patient history before consultation.

---

### F-AI-03: Prescription Explainer

**User:** Patient  
**Endpoint:** `POST /api/ai/explain-prescription`

**Input:**
- Prescription ID

**Output:**
- Simple-language explanation of the full prescription
- Per-medication explanations

**Purpose:** Help patients understand their prescriptions.

---

## Forbidden AI Features

Do not implement unless explicitly approved:

- AI Chatbot
- Voice Assistant
- AI Doctor
- AI Diagnosis Engine
- AI Appointment Assistant

---

## Architecture

```
Frontend → POST /api/ai/* → ai.controller → ai.service → Gemini API
```

- All Gemini logic in `ai.service.js`
- Prompts defined in `Documentation/prompts/ai-prompts.md`
- Response parsing and validation in service layer

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-AI-01 | Patient | Analyze my symptoms | I know which department to visit |
| US-AI-02 | Doctor | Summarize patient history | I save time before consultation |
| US-AI-03 | Patient | Understand my prescription | I take medications correctly |

---

## API Endpoints

See `api-contracts.md` — Section 10: AI Module.

---

## Safety Requirements

1. Every response includes disclaimer: "This is not a medical diagnosis"
2. Symptom analyzer uses cautious language ("possible conditions")
3. No medication recommendations from symptom analyzer
4. AI failures return graceful errors (502/504), never crash the app
5. Rate limit: 5 requests per minute per user

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Symptom Analyzer | `/patient/ai/symptoms` | PATIENT |
| Prescription Explainer | `/patient/ai/prescription/:id` | PATIENT |
| AI Summarize (button) | In consultation workspace | DOCTOR |

---

## Gemini Configuration

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { temperature: 0.3 }
});
```

---

## Acceptance Criteria

- [ ] Symptom analyzer returns conditions, department, urgency
- [ ] Record summarizer returns structured summary from patient data
- [ ] Prescription explainer returns simple-language explanation
- [ ] All responses include medical disclaimer
- [ ] Gemini SDK used only in `ai/` module
- [ ] Other modules call AI via HTTP endpoints
- [ ] Graceful error handling for API failures
- [ ] Rate limiting enforced
