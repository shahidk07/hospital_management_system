import express from 'express';
import { getLogs, getLogById } from './audit-logs.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = express.Router();

// All audit log endpoints are ADMIN only
router.use(authenticate, authorize('ADMIN'));

router.get('/', getLogs);
router.get('/:id', getLogById);

export default router;
