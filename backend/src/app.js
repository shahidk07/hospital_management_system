import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware.js';

// Import route files
import authRoutes from './modules/auth/auth.routes.js';
import patientRoutes from './modules/patients/patients.routes.js';
import appointmentRoutes from './modules/appointments/appointments.routes.js';
import departmentRoutes from './modules/departments/departments.routes.js';
import consultationRoutes from './modules/consultations/consultations.routes.js';
import emrRoutes from './modules/emr/emr.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import auditLogRoutes from './modules/audit-logs/audit-logs.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Register routes in correct order
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/ai', aiRoutes);

// 404 Route Not Found Handler
app.use('*', (req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

export default app;
