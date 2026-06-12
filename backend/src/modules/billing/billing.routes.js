import express from 'express';
import { getInvoices, getInvoiceById, createInvoice, createOrder, verifyPayment, handleWebhook } from './billing.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = express.Router();

// Public webhook route
router.post('/payments/webhook', handleWebhook);

// Protected routes
router.use(authenticate);

router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', authorize('ADMIN'), createInvoice);

router.post('/payments/create-order', authorize('PATIENT'), createOrder);
router.post('/payments/verify', authorize('PATIENT'), verifyPayment);

export default router;
