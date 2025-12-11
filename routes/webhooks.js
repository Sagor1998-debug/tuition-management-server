const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('Webhook verified — Event:', event.type);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Your existing handler (you can keep checkout.session.completed or change to payment_intent.succeeded)
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    console.log('Payment SUCCESS! Event:', event.type);
    console.log('PaymentIntent ID:', event.data.object.id);
    // TODO: Add your DB logic here later
  }

  res.json({ received: true });
});

module.exports = router;