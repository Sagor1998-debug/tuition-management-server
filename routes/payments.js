// routes/payments.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Payment = require('../models/Payment');
const TutorApplication = require('../models/TutorApplication');
const TuitionPost = require('../models/TuitionPost');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Payment Intent (called when student clicks "Accept & Pay")
router.post('/create-intent', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can pay' });

  const { applicationId } = req.body;

  try {
    const application = await TutorApplication.findById(applicationId)
      .populate('tuition')
      .populate('tutor');

    if (!application || application.status !== 'pending') {
      return res.status(400).json({ msg: 'Invalid or already processed application' });
    }

    // Verify student owns the tuition
    const tuition = await TuitionPost.findOne({
      _id: application.tuition._id,
      postedBy: req.user.id
    });
    if (!tuition) return res.status(403).json({ msg: 'Not your tuition' });

    const amount = application.expectedSalary; // BDT

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: 'bdt',
      metadata: {
        applicationId: application._id.toString(),
        studentId: req.user.id,
        tutorId: application.tutor._id.toString(),
        tuitionId: application.tuition._id.toString()
      },
      description: `Tuition payment for ${application.tuition.subject}`
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Create intent error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// STRIPE WEBHOOK — SECURE SERVER-SIDE CONFIRMATION
// This is the ONLY place where application is approved
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const applicationId = paymentIntent.metadata.applicationId;

    try {
      // Approve application
      const application = await TutorApplication.findByIdAndUpdate(
        applicationId,
        { status: 'approved' },
        { new: true }
      );

      if (application) {
        // Create payment record
        const payment = new Payment({
          student: paymentIntent.metadata.studentId,
          tutor: paymentIntent.metadata.tutorId,
          tuition: paymentIntent.metadata.tuitionId,
          application: applicationId,
          amount: paymentIntent.amount / 100,
          stripePaymentIntentId: paymentIntent.id,
          status: 'completed'
        });
        await payment.save();

        console.log(`Payment successful & application ${applicationId} approved`);
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  res.json({ received: true });
});

// Get payment history (for student, tutor, admin)
router.get('/history', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'tutor') {
      query.tutor = req.user.id;
    } // admin sees all

    const payments = await Payment.find(query)
      .populate('student', 'name')
      .populate('tutor', 'name')
      .populate('tuition', 'subject')
      .populate('application')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;