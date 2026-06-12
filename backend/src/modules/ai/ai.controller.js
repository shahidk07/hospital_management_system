import aiService from './ai.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const analyzeSymptoms = async (req, res, next) => {
  try {
    const { symptoms, duration, additionalInfo } = req.body;
    const result = await aiService.analyzeSymptoms({ symptoms, duration, additionalInfo });
    sendSuccess(res, result, 'Symptom analysis completed');
  } catch (error) {
    next(error);
  }
};

export const summarizeRecords = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    const result = await aiService.summarizeRecords(patientId);
    sendSuccess(res, result, 'Medical record summary completed');
  } catch (error) {
    next(error);
  }
};

export const explainPrescription = async (req, res, next) => {
  try {
    const { prescriptionId } = req.body;
    const result = await aiService.explainPrescription(prescriptionId);
    sendSuccess(res, result, 'Prescription explanation completed');
  } catch (error) {
    next(error);
  }
};
