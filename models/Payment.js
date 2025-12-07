const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorApplication', required: true },
  amount: { type: Number, required: true },
  stripePaymentIntentId: String,
  status: { type: String, default: 'completed' },
  paidAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);