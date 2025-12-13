// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String },
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },
  phone: String,
  photoUrl: {
    type: String,
    default: 'https://i.imgur.com/0yQ9McP.png'
  },
  qualifications: { type: String },  // ← added
  experience: { type: String },      // ← added
  ratings: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      date: { type: Date, default: Date.now }
    }
  ],
  bookmarks: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'TuitionPost' }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
