const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  tuition: { type: mongoose.Schema.Types.ObjectId, ref: 'TuitionPost', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expectedSalary: { type: Number, required: true },
  message: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TutorApplication', applicationSchema);