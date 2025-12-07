// routes/applications.js
const express = require('express');
const TutorApplication = require('../models/TutorApplication');
const TuitionPost = require('../models/TuitionPost');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const router = express.Router();

// Tutor applies to a tuition
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ msg: 'Only tutors can apply' });
  
  const { tuitionId, expectedSalary, message } = req.body;
  try {
    const tuition = await TuitionPost.findOne({ _id: tuitionId, status: 'approved' });
    if (!tuition) return res.status(404).json({ msg: 'Tuition not found or not approved' });

    const application = new TutorApplication({
      tuition: tuitionId,
      tutor: req.user.id,
      expectedSalary,
      message
    });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Student sees all applications for his tuition
router.get('/my-tuitions', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Access denied' });
  try {
    const tuitions = await TuitionPost.find({ postedBy: req.user.id }).select('_id');
    const tuitionIds = tuitions.map(t => t._id);
    const applications = await TutorApplication.find({ tuition: { $in: tuitionIds } })
      .populate('tutor', 'name phone photoUrl')
      .populate('tuition', 'title subject salary');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Student approves application → creates payment record
router.post('/:id/approve', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only student can approve' });
  try {
    const application = await TutorApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    // Optional: check if this tuition belongs to the student
    const tuition = await TuitionPost.findOne({ _id: application.tuition, postedBy: req.user.id });
    if (!tuition) return res.status(403).json({ msg: 'Not your tuition' });

    application.status = 'approved';
    await application.save();

    // Create payment record (after Stripe success on frontend)
    // Frontend will call /payments/confirm after successful Stripe payment

    res.json({ msg: 'Application approved', application });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;