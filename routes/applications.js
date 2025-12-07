const express = require('express');
const TutorApplication = require('../models/TutorApplication');
const TuitionPost = require('../models/TuitionPost');
const auth = require('../middleware/auth');
const router = express.Router();

// Apply to tuition (tutor only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ msg: 'Only tutors can apply' });
  const application = new TutorApplication({
    tuition: req.body.tuitionId,
    tutor: req.user.id,
    expectedSalary: req.body.expectedSalary,
    message: req.body.message
  });
  await application.save();
  res.json(application);
});

module.exports = router;