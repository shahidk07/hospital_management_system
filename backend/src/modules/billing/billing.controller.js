import billingService from './billing.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getInvoices = async (req, res, next) => {
  try {
    const result = await billingService.getInvoices(req.query, req.user);
    sendSuccess(res, result, 'Invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const result = await billingService.getInvoiceById(req.params.id, req.user);
    sendSuccess(res, result, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const result = await billingService.createInvoice(req.body);
    sendSuccess(res, result, 'Invoice created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;
    const result = await billingService.createOrder(invoiceId, req.user);
    sendSuccess(res, result, 'Razorpay order created successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const result = await billingService.verifyPayment(req.body, req);
    sendSuccess(res, result, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    await billingService.handleWebhook(req.body, signature, req);
    sendSuccess(res, {}, 'Webhook processed successfully');
  } catch (error) {
    next(error);
  }
};
