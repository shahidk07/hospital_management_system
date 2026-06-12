import express from 'express';
import { getOverview, getRevenue, getAppointments, getDepartments } from './analytics.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = express.Router();

// All analytics endpoints are ADMIN only
router.use(authenticate, authorize('ADMIN'));

router.get('/overview', getOverview);
router.get('/revenue', getRevenue);
router.get('/appointments', getAppointments);
router.get('/departments', getDepartments);

export default router;
