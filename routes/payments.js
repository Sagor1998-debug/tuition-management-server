// routes/payments.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Payment = require('../models/Payment');
const TutorApplication = require('../models/TutorApplication');
const auth = require('../middleware/auth');
const router = express.Router();

// Create payment intent (called from frontend)
router.post('/create-intent', auth, async (req, res) => {
  const { applicationId, amount } = req.body;
  try {
    const intent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: 'usd',
      metadata: { applicationId }
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Confirm payment after success (called from frontend)
router.post('/confirm', auth, async (req, res) => {
  const { applicationId, amount, paymentIntentId } = req.body;
  try {
    const payment = new Payment({
      application: applicationId,
      amount,
      stripePaymentIntentId: paymentIntentId
    });
    await payment.save();

    // Update application status to approved only after payment
    await TutorApplication.findByIdAndUpdate(applicationId, { status: 'approved' });

    res.json({ msg: 'Payment successful & tutor approved' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get payment history (for student & tutor)
router.get('/history', auth, async (req, res) => {
  try {
    let payments;
    if (req.user.role === 'admin') {
      payments = await Payment.find().populate('application');
    } else {
      payments = await Payment.find({
        $or: [
          { 'application.tuition.postedBy': req.user.id }, // student paid
          { 'application.tutor': req.user.id }              // tutor received
        ]
      }).populate('application');
    }
    res.json(payments);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;