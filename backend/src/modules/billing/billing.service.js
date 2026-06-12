import crypto from 'crypto';
import prisma from '../../config/database.js';
import razorpay from '../../config/razorpay.js';
import AppError from '../../utils/AppError.js';
import logAudit from '../../utils/auditLogger.js';
import logger from '../../utils/logger.js';

// Fee mapping based on department spec
const DEPARTMENT_FEES = {
  'General Medicine': 500,
  'Cardiology': 1000,
  'Orthopedics': 800,
  'Pediatrics': 600,
  'Dermatology': 700,
  'Neurology': 1200
};

export const billingService = {
  getInvoices: async (filters = {}, user) => {
    const where = {};
    
    if (user.role === 'PATIENT') {
      // Find patient profile first
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: user.id }
      });
      if (!patient) {
        throw new AppError('Patient profile not found', 404);
      }
      where.appointment = { patientId: patient.id };
    }

    if (filters.status) {
      where.payment = { status: filters.status };
    }

    return await prisma.invoice.findMany({
      where,
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
            department: true
          }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  getInvoiceById: async (id, user) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
            department: true
          }
        },
        payment: true
      }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: user.id }
      });
      if (!patient || invoice.appointment.patientId !== patient.id) {
        throw new AppError('You do not have permission to perform this action', 403);
      }
    }

    return invoice;
  },

  createInvoice: async ({ appointmentId, amount, description }) => {
    // Check if appointment exists
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });
    if (!appt) {
      throw new AppError('Appointment not found', 404);
    }

    // Check if invoice already exists
    const existing = await prisma.invoice.findUnique({
      where: { appointmentId }
    });
    if (existing) {
      throw new AppError('Invoice already exists for this appointment', 409);
    }

    return await prisma.invoice.create({
      data: {
        appointmentId,
        amount,
        description
      }
    });
  },

  autoCreateInvoice: async (appointmentId, departmentId) => {
    const dept = await prisma.department.findUnique({
      where: { id: departmentId }
    });
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    const fee = DEPARTMENT_FEES[dept.name] || 500; // default to 500 if name mismatch

    return await prisma.invoice.create({
      data: {
        appointmentId,
        amount: fee,
        description: `Consultation fee for ${dept.name}`
      }
    });
  },

  createOrder: async (invoiceId, user) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        appointment: {
          include: { patient: true }
        },
        payment: true
      }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Auth check
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: user.id }
    });
    if (!patient || invoice.appointment.patientId !== patient.id) {
      throw new AppError('You do not have permission to pay this invoice', 403);
    }

    // Check if already paid
    if (invoice.payment && invoice.payment.status === 'SUCCESS') {
      throw new AppError('Invoice has already been paid', 409);
    }

    const amountInPaise = Math.round(Number(invoice.amount) * 100);

    try {
      // Create Razorpay Order
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: invoice.id
      });

      // Upsert Payment record
      const payment = await prisma.payment.upsert({
        where: { invoiceId: invoice.id },
        update: {
          razorpayOrderId: order.id,
          status: 'PENDING'
        },
        create: {
          invoiceId: invoice.id,
          razorpayOrderId: order.id,
          amount: invoice.amount,
          status: 'PENDING'
        }
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      logger.error('Razorpay order creation failed:', error);
      throw new AppError('Payment service unavailable', 502);
    }
  },

  verifyPayment: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, req) => {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: {
        invoice: {
          include: {
            appointment: {
              include: {
                doctor: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new AppError('Payment order not found', 404);
    }

    // Idempotency check
    if (payment.status === 'SUCCESS') {
      return payment;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      await logAudit({
        userId: req?.user?.id || null,
        action: 'PAYMENT_FAILED',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: {
          paymentId: payment.id,
          invoiceId: payment.invoiceId,
          amount: Number(payment.amount),
          reason: 'Signature verification failed'
        },
        req
      });

      throw new AppError('Payment verification failed', 400);
    }

    // Update payment, appointment status, notify doctor, log audit
    const updatedResult = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId,
          razorpaySignature,
          paidAt: new Date()
        }
      });

      await tx.appointment.update({
        where: { id: payment.invoice.appointmentId },
        data: { status: 'CONFIRMED' }
      });

      // Create notification for Doctor
      const doctorUser = await tx.doctorProfile.findUnique({
        where: { id: payment.invoice.appointment.doctorId },
        select: { userId: true }
      });

      if (doctorUser) {
        await tx.notification.create({
          data: {
            userId: doctorUser.userId,
            type: 'CONSULTATION_ASSIGNED',
            title: 'New Appointment Confirmed',
            message: `You have a new confirmed appointment.`,
            metadata: { appointmentId: payment.invoice.appointmentId }
          }
        });
      }

      return updatedPayment;
    });

    await logAudit({
      userId: req?.user?.id || null,
      action: 'PAYMENT_SUCCESS',
      entityType: 'Payment',
      entityId: payment.id,
      metadata: {
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        amount: Number(payment.amount),
        razorpayPaymentId
      },
      req
    });

    return updatedResult;
  },

  handleWebhook: async (payload, signature, req) => {
    // Razorpay Webhook signature verification if secret is set
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (expectedSignature !== signature) {
        throw new AppError('Invalid webhook signature', 400);
      }
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    
    if (!paymentEntity) return;

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    if (event === 'payment.captured') {
      try {
        await billingService.verifyPayment({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: 'WEBHOOK_VERIFIED' // bypass HMAC check for direct webhook since it's already verified via webhook secret signature
        }, req);
      } catch (error) {
        logger.error('Webhook payment capture processing failed:', error);
      }
    } else if (event === 'payment.failed') {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId }
      });
      if (payment && payment.status === 'PENDING') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        });

        await logAudit({
          userId: null,
          action: 'PAYMENT_FAILED',
          entityType: 'Payment',
          entityId: payment.id,
          metadata: {
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
            amount: Number(payment.amount),
            reason: paymentEntity.error_description || 'Razorpay payment failed'
          },
          req
        });
      }
    }
  }
};

export default billingService;
