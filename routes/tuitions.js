const express = require('express');
const TuitionPost = require('../models/TuitionPost');
const auth = require('../middleware/auth');

const router = express.Router();

/* =====================================================
   Public: Get all APPROVED tuitions with filters
===================================================== */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const { search, subject, location, minSalary, maxSalary, sort } = req.query;

    let query = { status: 'approved' };

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
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
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   Student: Get ONLY own tuitions  ✅ MOVED UP
===================================================== */
router.get('/my', auth, async (req, res) => {
  try {
    const tuitions = await TuitionPost.find({
      postedBy: req.user.id
    })
      .populate('postedBy', 'name phone')
      .sort({ createdAt: -1 });

    res.json(tuitions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =====================================================
   Admin & Student: Manage tuitions
===================================================== */
router.get('/manage', auth, async (req, res) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { postedBy: req.user.id };

    const data = await TuitionPost.find(query)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   Public: Get single APPROVED tuition by ID
===================================================== */
router.get('/:id', async (req, res) => {
  try {
    const tuition = await TuitionPost.findOne({
      _id: req.params.id,
      status: 'approved'
    }).populate('postedBy', 'name phone');

    if (!tuition) {
      return res.status(404).json({ msg: 'Tuition not found' });
    }

    res.json(tuition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Invalid tuition ID' });
  }
});

/* =====================================================
   Student: Create tuition (pending)
===================================================== */
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Only students can post' });
  }

  try {
    const tuition = new TuitionPost({
      ...req.body,
      postedBy: req.user.id
    });

    await tuition.save();
    res.json(tuition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   Student: Update own tuition
===================================================== */
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Only students can update' });
  }

  try {
    const tuition = await TuitionPost.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name phone');

    if (!tuition) {
      return res
        .status(404)
        .json({ msg: 'Tuition not found or not owner' });
    }

    res.json(tuition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =====================================================
   Student: Delete own tuition
===================================================== */
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Only students can delete' });
  }

  try {
    const tuition = await TuitionPost.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    });

    if (!tuition) {
      return res
        .status(404)
        .json({ msg: 'Tuition not found or not owner' });
    }

    res.json({ msg: 'Tuition deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =====================================================
   Admin: Approve / Reject tuition
===================================================== */
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    const tuition = await TuitionPost.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!tuition) {
      return res.status(404).json({ msg: 'Tuition not found' });
    }

    res.json(tuition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
