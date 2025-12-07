const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
  phone: { type: String },
  photoUrl: { type: String, default: 'https://i.imgur.com/0yQ9McP.png' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);