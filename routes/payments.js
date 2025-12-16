// routes/payments.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Payment = require('../models/Payment');
const TutorApplication = require('../models/TutorApplication');
const TuitionPost = require('../models/TuitionPost');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Checkout Session
router.post('/create-checkout-session', auth, async (req, res) => {
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

    const amount = application.expectedSalary;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: `Tuition: ${application.tuition.subject} - ${application.tuition.class}`, // ← FIXED backticks
              description: `Tutor: ${application.tutor.name} | Salary: ৳${amount}/month` // ← FIXED backticks
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/dashboard/applications?success=true',
      cancel_url: 'http://localhost:5173/dashboard/applications?cancel=true',
      metadata: {
        applicationId: application._id.toString(),
        studentId: req.user.id,
        tutorId: application.tutor._id.toString(),
        tuitionId: application.tuition._id.toString()
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// WEBHOOK
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_status === 'paid') {
      const applicationId = session.metadata.applicationId;

      try {
        const application = await TutorApplication.findByIdAndUpdate(
          applicationId,
          { status: 'approved' },
          { new: true }
        );

        if (application) {
          const payment = new Payment({
            student: session.metadata.studentId,
            tutor: session.metadata.tutorId,
            tuition: session.metadata.tuitionId,
            application: applicationId,
            amount: session.amount_total / 100,
            stripePaymentIntentId: session.payment_intent,
            status: 'completed'
          });
          await payment.save();

          console.log(`Payment successful & application ${applicationId} approved`);
        }
      } catch (err) {
        console.error('Webhook error:', err);
      }
    }
  }

  res.json({ received: true });
});

// Payment history
router.get('/history', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user.id;
    else if (req.user.role === 'tutor') query.tutor = req.user.id;

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