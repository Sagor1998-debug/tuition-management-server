const mongoose = require('mongoose');

const tuitionPostSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },

  // ✔️ Your data uses "details"
  details: { type: String, required: true },

  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TuitionPost', tuitionPostSchema);
