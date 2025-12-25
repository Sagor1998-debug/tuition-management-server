// dev.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

const User = require('../models/User');
const TuitionPost = require('../models/TuitionPost');

// =========================
// AUTH MIDDLEWARE
// =========================
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// =========================
// AUTH ROUTES
// =========================

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || 'student',
    });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// =========================
// USERS
// =========================

// Current logged-in user
router.get('/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Public: get all tutors
router.get('/users/tutors', async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password');
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Public: get tutor by ID
router.get('/users/tutors/:id', async (req, res) => {
  try {
    const tutor = await User.findOne({ _id: req.params.id, role: 'tutor' }).select('-password');
    if (!tutor) return res.status(404).json({ msg: 'Tutor not found' });
    res.json(tutor);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// =========================
// TUITIONS
// =========================

// Public: get all tuitions
router.get('/tuitions', async (req, res) => {
  try {
    const tuitions = await TuitionPost.find().populate('postedBy', 'name email');
    res.json(tuitions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Public: get tuition by ID
router.get('/tuitions/:id', async (req, res) => {
  try {
    const tuition = await TuitionPost.findById(req.params.id).populate('postedBy', 'name email');
    if (!tuition) return res.status(404).json({ msg: 'Tuition not found' });
    res.json(tuition);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
