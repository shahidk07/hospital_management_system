import express from 'express';
import { register, login, refresh, logout, getMe, createDoctor } from './auth.controller.js';
import { registerSchema, loginSchema, refreshSchema, createDoctorSchema } from './auth.validation.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshSchema), refresh);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/doctors', authenticate, authorize('ADMIN'), validateBody(createDoctorSchema), createDoctor);

export default router;
