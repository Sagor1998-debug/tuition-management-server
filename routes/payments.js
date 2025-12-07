const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Payment = require('../models/Payment');
const TutorApplication = require('../models/TutorApplication');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create-intent', auth, async (req, res) => {
  const { applicationId, amount } = req.body;
  const intent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: { applicationId }
  });
  res.json({ clientSecret: intent.client_secret });
});

module.exports = router;