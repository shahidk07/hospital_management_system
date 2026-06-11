# AI Runtime Prompts (Gemini API)

**Module:** `ai/`  
**Owner:** Shahid  
**Model:** `gemini-1.5-flash`  
**Temperature:** 0.3

These prompts are sent to the Gemini API at runtime. All include safety disclaimers.

---

## System Preamble (Include in All Prompts)

```
You are an informational healthcare assistant for a hospital management system.
You are NOT a medical professional and cannot provide diagnoses.

Rules:
- Use cautious language ("may suggest", "possible conditions")
- Never recommend specific medications
- Always include a disclaimer
- Respond ONLY in valid JSON matching the requested schema
- If input is insufficient, indicate that in the response
```

---

## Prompt 1: Symptom Analyzer

### Input Template

```
Analyze the following symptoms and provide guidance on which hospital department
the patient should visit. This is NOT a medical diagnosis.

Symptoms: {{symptoms}}
Duration: {{duration}}
Additional Information: {{additionalInfo}}

Respond in this exact JSON format:
{
  "possibleConditions": ["condition1", "condition2"],
  "recommendedDepartment": "department name",
  "urgencyLevel": "LOW|MEDIUM|HIGH|EMERGENCY",
  "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
}

Available departments: General Medicine, Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology

Urgency guidelines:
- LOW: Mild symptoms, no immediate concern
- MEDIUM: Moderate symptoms, schedule appointment soon
- HIGH: Significant symptoms, seek care within 24 hours
- EMERGENCY: Life-threatening symptoms, seek immediate emergency care
```

### Expected Output

```json
{
  "possibleConditions": ["Common cold", "Seasonal allergies"],
  "recommendedDepartment": "General Medicine",
  "urgencyLevel": "LOW",
  "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
}
```

---

## Prompt 2: Medical Record Summarizer

### Input Template

```
Summarize the following patient medical history for a doctor preparing for consultation.
Provide a concise clinical summary.

Patient Information:
- Name: {{firstName}} {{lastName}}
- Age: {{age}}
- Gender: {{gender}}
- Blood Group: {{bloodGroup}}
- Allergies: {{allergies}}

Medical Records:
{{#each records}}
- [{{type}}] {{title}}: {{description}} ({{createdAt}})
{{/each}}

Previous Consultations:
{{#each consultations}}
- Diagnosis: {{diagnosis}} | Treatment: {{treatmentPlan}} ({{completedAt}})
{{/each}}

Current Medications:
{{#each prescriptions}}
- {{medications}}
{{/each}}

Respond in this exact JSON format:
{
  "summary": "A 2-3 paragraph clinical summary",
  "keyPoints": {
    "diseases": ["list of known conditions"],
    "allergies": ["list of allergies"],
    "surgeries": ["list of past surgeries if mentioned"],
    "currentMedications": ["list of current medications"]
  }
}
```

---

## Prompt 3: Prescription Explainer

### Input Template

```
Explain the following prescription in simple, patient-friendly language.
Avoid medical jargon. Help the patient understand what each medicine does and how to take it.

Prescription:
{{#each medications}}
- {{name}}: {{dosage}}, {{frequency}}, for {{duration}}
  Instructions: {{instructions}}
{{/each}}

General Instructions: {{instructions}}

Respond in this exact JSON format:
{
  "explanation": "Overall explanation of the prescription in simple language",
  "medications": [
    {
      "name": "medicine name",
      "simpleExplanation": "What this medicine does and how to take it, in plain language"
    }
  ],
  "disclaimer": "Always follow your doctor's instructions. Consult your doctor if you experience side effects."
}
```

---

## Response Validation

After receiving Gemini response, validate in `ai.service.js`:

```javascript
function validateSymptomResponse(data) {
  if (!data.possibleConditions || !Array.isArray(data.possibleConditions)) {
    throw new AppError('Invalid AI response format', 502);
  }
  if (!['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'].includes(data.urgencyLevel)) {
    data.urgencyLevel = 'MEDIUM'; // safe default
  }
  if (!data.disclaimer) {
    data.disclaimer = 'This is not a medical diagnosis. Please consult a healthcare professional.';
  }
  return data;
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Empty symptoms | Return 400 before calling Gemini |
| Gemini timeout (>10s) | Return 504 |
| Gemini API error | Return 502 |
| Invalid JSON response | Return 502 with retry message |
| Rate limit exceeded | Return 429 |
