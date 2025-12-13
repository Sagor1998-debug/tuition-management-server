// routes/users.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/* =========================
   ADMIN: GET ALL USERS
========================= */
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   PUBLIC: GET ALL TUTORS
========================= */
router.get('/tutors', async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   PUBLIC: GET SINGLE TUTOR
========================= */
router.get('/tutors/:id', async (req, res) => {
  try {
    const tutor = await User.findOne({
      _id: req.params.id,
      role: 'tutor'
    }).select('-password');

    if (!tutor) {
      return res.status(404).json({ msg: 'Tutor not found' });
    }

    res.json(tutor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   STUDENT: RATE TUTOR
========================= */
router.post('/rate/:tutorId', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Only students can rate' });
  }

  const { rating, review } = req.body;

  try {
    const tutor = await User.findById(req.params.tutorId);
    if (!tutor) return res.status(404).json({ msg: 'Tutor not found' });

    tutor.ratings.push({
      student: req.user.id,
      rating,
      review
    });

    await tutor.save();
    res.json({ msg: 'Rating submitted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   AUTH USER: BOOKMARK TUITION
========================= */
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

/* =========================
   AUTH USER: PROFILE
========================= */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
