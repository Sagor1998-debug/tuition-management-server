// routes/admin.js
const express = require('express');
const User = require('../models/User');
const TuitionPost = require('../models/TuitionPost');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware: Admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access only' });
  next();
};

// Get all users (admin panel)
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update user role (e.g. make someone tutor/admin)
router.patch('/users/:id/role', auth, adminOnly, async (req, res) => {
  const { role } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ msg: 'Role updated' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all tuitions for moderation
router.get('/tuitions', auth, adminOnly, async (req, res) => {
  try {
    const tuitions = await TuitionPost.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tuitions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Reports & Analytics (for admin dashboard charts)
router.get('/reports', auth, adminOnly, async (req, res) => {
  try {
    const totalEarnings = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyEarnings = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidAt' } },
          earnings: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = {
      totalEarnings: totalEarnings[0]?.total || 0,
      totalTuitions: await TuitionPost.countDocuments(),
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalTutors: await User.countDocuments({ role: 'tutor' }),
      pendingTuitions: await TuitionPost.countDocuments({ status: 'pending' }),
      monthlyEarnings
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;