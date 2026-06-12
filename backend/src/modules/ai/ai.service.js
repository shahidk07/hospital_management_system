import groq from '../../config/gemini.js';
import prisma from '../../config/database.js';
import AppError from '../../utils/AppError.js';
import logger from '../../utils/logger.js';

const SYSTEM_PREAMBLE = `You are an informational healthcare assistant for a hospital management system.
You are NOT a medical professional and cannot provide diagnoses.

Rules:
- Use cautious language ("may suggest", "possible conditions")
- Never recommend specific medications
- Always include a disclaimer
- Respond ONLY in valid JSON matching the requested schema
- If input is insufficient, indicate that in the response
`;

// Helper to clean and parse JSON from Groq's response
function cleanAndParseJson(text) {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
  } catch (error) {
    logger.error('JSON parsing failed for text:', text);
    throw new AppError('Invalid JSON response format from AI service', 502);
  }
}

// Helper to calculate age
function calculateAge(dob) {
  if (!dob) return 'N/A';
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Wrapper for Groq API calls with timeout
async function callGroq(prompt) {
  try {
    // Create a timeout promise (10 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 10000)
    );

    // Call Groq API
    const apiCallPromise = groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PREAMBLE },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    // Race the API call against the timeout
    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    
    const responseText = result.choices[0].message.content;
    return cleanAndParseJson(responseText);
  } catch (error) {
    if (error.message === 'timeout') {
      throw new AppError('AI service timed out. Please try again.', 504);
    }
    logger.error('Groq API call failed:', error);
    throw new AppError('AI service unavailable', 502);
  }
}

export const aiService = {
  analyzeSymptoms: async ({ symptoms, duration = 'not specified', additionalInfo = 'none' }) => {
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      throw new AppError('Please provide at least one symptom', 400);
    }

    const prompt = `Analyze the following symptoms and provide guidance on which hospital department the patient should visit. This is NOT a medical diagnosis.

Symptoms: ${symptoms.join(', ')}
Duration: ${duration}
Additional Information: ${additionalInfo}

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
- EMERGENCY: Life-threatening symptoms, seek immediate emergency care`;

    const data = await callGroq(prompt);
    
    // Validate output format
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
  },

  summarizeRecords: async (patientId) => {
    if (!patientId) {
      throw new AppError('Patient ID is required', 400);
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        medicalRecords: true,
        appointments: {
          include: {
            consultation: {
              include: {
                prescription: true
              }
            }
          }
        }
      }
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Extract consultations and prescriptions
    const consultations = [];
    const prescriptions = [];
    for (const appt of patient.appointments) {
      if (appt.consultation) {
        consultations.push({
          diagnosis: appt.consultation.diagnosis,
          treatmentPlan: appt.consultation.treatmentPlan,
          completedAt: appt.consultation.completedAt
        });
        if (appt.consultation.prescription) {
          prescriptions.push(appt.consultation.prescription);
        }
      }
    }

    const prompt = `Summarize the following patient medical history for a doctor preparing for consultation. Provide a concise clinical summary.

Patient Information:
- Name: ${patient.firstName} ${patient.lastName}
- Age: ${calculateAge(patient.dateOfBirth)}
- Gender: ${patient.gender}
- Blood Group: ${patient.bloodGroup || 'Not specified'}
- Allergies: ${patient.allergies || 'None reported'}

Medical Records:
${patient.medicalRecords.length > 0 
  ? patient.medicalRecords.map(r => `- [${r.type}] ${r.title}: ${r.description || ''} (${r.createdAt})`).join('\n')
  : '- No uploaded records'}

Previous Consultations:
${consultations.length > 0 
  ? consultations.map(c => `- Diagnosis: ${c.diagnosis || 'None'} | Treatment: ${c.treatmentPlan || 'None'} (${c.completedAt})`).join('\n')
  : '- No previous consultations'}

Current Medications:
${prescriptions.length > 0 
  ? prescriptions.map(p => `- ${JSON.stringify(p.medications)}`).join('\n')
  : '- No current medications'}

Respond in this exact JSON format:
{
  "summary": "A 2-3 paragraph clinical summary",
  "keyPoints": {
    "diseases": ["list of known conditions"],
    "allergies": ["list of allergies"],
    "surgeries": ["list of past surgeries if mentioned"],
    "currentMedications": ["list of current medications"]
  }
}`;

    const data = await callGroq(prompt);
    
    if (!data.summary || !data.keyPoints) {
      throw new AppError('Invalid AI response format', 502);
    }
    return data;
  },

  explainPrescription: async (prescriptionId) => {
    if (!prescriptionId) {
      throw new AppError('Prescription ID is required', 400);
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId }
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    const medications = prescription.medications; // JSON array
    const instructions = prescription.instructions;

    const prompt = `Explain the following prescription in simple, patient-friendly language. Avoid medical jargon. Help the patient understand what each medicine does and how to take it.

Prescription:
${Array.isArray(medications) 
  ? medications.map(m => `- ${m.name}: ${m.dosage || ''}, ${m.frequency || ''}, for ${m.duration || ''}\n  Instructions: ${m.instructions || ''}`).join('\n')
  : '- ' + JSON.stringify(medications)}

General Instructions: ${instructions || 'None'}

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
}`;

    const data = await callGroq(prompt);
    if (!data.explanation || !data.medications) {
      throw new AppError('Invalid AI response format', 502);
    }
    return data;
  }
};

export default aiService;
