import express from 'express';
import { getDepartments, getDoctorsInDepartment } from './departments.controller.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id/doctors', getDoctorsInDepartment);

export default router;
