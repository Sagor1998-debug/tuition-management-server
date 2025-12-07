const express = require('express');
const TuitionPost = require('../models/TuitionPost');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all approved tuitions (public + search + pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';
    const query = {
      status: 'approved',
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ]
    };

    const tuitions = await TuitionPost.find(query)
      .populate('postedBy', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TuitionPost.countDocuments(query);

    res.json({ tuitions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Create tuition (student only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ msg: 'Access denied' });
    const tuition = new TuitionPost({ ...req.body, postedBy: req.user.id });
    await tuition.save();
    res.json(tuition);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;