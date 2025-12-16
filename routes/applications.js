// routes/applications.js
const express = require('express');
const TutorApplication = require('../models/TutorApplication');
const TuitionPost = require('../models/TuitionPost');
const auth = require('../middleware/auth');
const router = express.Router();

/* ===============================
   TUTOR: Apply to a tuition
=============================== */
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ msg: 'Only tutors can apply' });
  
  const { tuitionId, expectedSalary, message, qualifications, experience } = req.body;

  if (!tuitionId || !expectedSalary || !qualifications || !experience) {
    return res.status(400).json({ msg: 'All fields are required: tuitionId, expectedSalary, qualifications, experience' });
  }

  try {
    const tuition = await TuitionPost.findOne({ _id: tuitionId, status: 'approved' });
    if (!tuition) return res.status(404).json({ msg: 'Tuition not found or not approved' });

    const existingApp = await TutorApplication.findOne({ tuition: tuitionId, tutor: req.user.id });
    if (existingApp) return res.status(400).json({ msg: 'You have already applied to this tuition' });

    const application = new TutorApplication({
      tuition: tuitionId,
      tutor: req.user.id,
      expectedSalary,
      message: message || '',
      qualifications,
      experience
    });

    await application.save();
    await application.populate('tutor', 'name photoUrl');
    await application.populate('tuition', 'subject class location salary');

    res.json(application);
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ===============================
   TUTOR: Get all my applications
=============================== */
router.get('/my-applications', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ msg: 'Only tutors can view their applications' });

  try {
    const applications = await TutorApplication.find({ tutor: req.user.id })
      .populate('tuition', 'subject class location salary')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ===============================
   STUDENT: Get all applications for my tuitions
=============================== */
router.get('/my', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Access denied' });
  
  try {
    const tuitions = await TuitionPost.find({ postedBy: req.user.id }).select('_id');
    const tuitionIds = tuitions.map(t => t._id);

    const applications = await TutorApplication.find({ tuition: { $in: tuitionIds } })
      .populate('tutor', 'name photoUrl qualifications experience')
      .populate('tuition', 'subject class location salary')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ===============================
   STUDENT: Reject an application
=============================== */
router.patch('/:id/reject', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can reject' });
  
  try {
    const application = await TutorApplication.findOneAndUpdate(
      { _id: req.params.id },
      { status: 'rejected' },
      { new: true }
    )
    .populate('tutor', 'name')
    .populate('tuition', 'subject');

    if (!application) return res.status(404).json({ msg: 'Application not found' });

    // Ensure student owns the tuition
    const tuition = await TuitionPost.findOne({ _id: application.tuition, postedBy: req.user.id });
    if (!tuition) return res.status(403).json({ msg: 'Not your tuition' });

    res.json({ msg: 'Application rejected', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
