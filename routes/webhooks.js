const express = require('express');
require('dotenv').config();

const router = express.Router();

// Initialize Stripe with the ONE correct secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Webhook signing secret from Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * IMPORTANT:
 * - This route MUST receive raw body
 * - express.raw() must NOT be used globally
 * - index.js already mounts this route correctly
 */
router.post('/', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('❌ Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Stripe Webhook Received:', event.type);

  // Handle successful Checkout payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // These values come from metadata set during checkout creation
    const {
      applicationId,
      studentId,
      tutorId,
      tuitionId
    } = session.metadata || {};

    console.log('💰 Payment successful');
    console.log('Session ID:', session.id);
    console.log('Application ID:', applicationId);

    /**
     * IMPORTANT:
     * Your DB update logic is already handled
     * in payments.js (webhook or post-payment flow).
     *
     * If you later move DB logic here,
     * do it carefully and make it idempotent.
     */
  }

  // Always acknowledge receipt
  res.json({ received: true });
});

module.exports = router;
