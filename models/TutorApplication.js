const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  tuition: { type: mongoose.Schema.Types.ObjectId, ref: 'TuitionPost', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expectedSalary: { type: Number, required: true },
  message: { type: String }, // optional message
  qualifications: { type: String, required: true }, // ← NEW REQUIRED FIELD
  experience: { type: String, required: true },     // ← NEW REQUIRED FIELD
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now }
});

// Optional: Index for better performance
applicationSchema.index({ tuition: 1, tutor: 1 }, { unique: true }); // prevent duplicate applications

module.exports = mongoose.model('TutorApplication', applicationSchema);