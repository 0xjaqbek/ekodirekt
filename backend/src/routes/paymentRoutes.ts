import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';
import { validateCreatePaymentIntent } from '../middleware/validationMiddleware';
import express from 'express';

const router = Router();

/**
 * @route   POST /api/payments/create-intent
 * @desc    Tworzy intent płatności
 * @access  Private
 */
router.post('/create-intent', 
  authenticate, 
  validateCreatePaymentIntent,
  paymentController.createPaymentIntent
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Webhook dla Stripe
 * @access  Public
 */
// Konfiguracja dla surowych danych (nie parsowanych przez JSON middleware)
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

export default router;