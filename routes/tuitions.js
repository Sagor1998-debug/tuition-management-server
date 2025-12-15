// routes/tuitions.js
const express = require('express');
const TuitionPost = require('../models/TuitionPost');
const auth = require('../middleware/auth');
const router = express.Router();

// Public: Get all APPROVED tuitions with search, filter, sort, pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const { search, subject, location, minSalary, maxSalary, sort } = req.query;

    let query = { status: 'approved' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (subject) query.subject = subject;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    let sortBy = { createdAt: -1 };
    if (sort === 'salary_asc') sortBy = { salary: 1 };
    if (sort === 'salary_desc') sortBy = { salary: -1 };

    const tuitions = await TuitionPost.find(query)
      .populate('postedBy', 'name phone')
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TuitionPost.countDocuments(query);

    res.json({
      tuitions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Student: Create tuition (goes to pending)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can post' });
  try {
    const tuition = new TuitionPost({ ...req.body, postedBy: req.user.id });
    await tuition.save();
    res.json(tuition);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Student: Get only their own tuitions
router.get('/my', auth, async (req, res) => {
  try {
    const tuitions = await TuitionPost.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(tuitions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Student: Update own tuition post
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can update their posts' });
  
  try {
    const tuition = await TuitionPost.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id }, // Ensure only owner can update
      req.body,
      { new: true, runValidators: true }
    );

    if (!tuition) {
      return res.status(404).json({ msg: 'Tuition not found or you are not the owner' });
    }

    res.json(tuition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Student: Delete own tuition post
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can delete their posts' });
  
  try {
    const tuition = await TuitionPost.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    });

    if (!tuition) {
      return res.status(404).json({ msg: 'Tuition not found or you are not the owner' });
    }

    res.json({ msg: 'Tuition deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Approve or Reject tuition
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  const { status } = req.body; // "approved" or "rejected"
  try {
    const tuition = await TuitionPost.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(tuition);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Admin & Student: Get all tuitions (including pending)
router.get('/manage', auth, async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { postedBy: req.user.id };
  TuitionPost.find(query)
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 })
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ msg: err.message }));
});

module.exports = router;