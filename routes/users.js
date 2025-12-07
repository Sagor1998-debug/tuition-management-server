// routes/users.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin: Get all users
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Rate tutor
router.post('/rate/:tutorId', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can rate' });
  const { rating, review } = req.body;
  try {
    const tutor = await User.findById(req.params.tutorId);
    if (!tutor) return res.status(404).json({ msg: 'Tutor not found' });
    tutor.ratings.push({ student: req.user.id, rating, review });
    await tutor.save();
    res.json({ msg: 'Rating submitted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Bookmark tuition
router.post('/bookmark/:tuitionId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.bookmarks.includes(req.params.tuitionId)) {
      user.bookmarks.push(req.params.tuitionId);
      await user.save();
    }
    res.json({ msg: 'Bookmarked' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;