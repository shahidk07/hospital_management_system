import express from 'express';
import { analyzeSymptoms, summarizeRecords, explainPrescription } from './ai.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/analyze-symptoms', authorize('PATIENT'), analyzeSymptoms);
router.post('/summarize-records', authorize('DOCTOR'), summarizeRecords);
router.post('/explain-prescription', authorize('PATIENT'), explainPrescription);

export default router;
