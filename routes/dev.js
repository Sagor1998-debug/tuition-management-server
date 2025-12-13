const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TuitionPost = require('../models/TuitionPost');


// ─────────────────────────────────────────────
// GET ALL STUDENTS
// ─────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────
// GET STUDENT BY ID
// ─────────────────────────────────────────────
router.get('/students/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────
// GET ALL TUTORS
// ─────────────────────────────────────────────
router.get('/tutors', async (req, res) => {
  try {
    // fetch all tutors as plain JS objects
    const tutors = await User.find({ role: 'tutor' }).lean();

    // inject default qualifications and experience if missing
    const tutorsWithDefaults = tutors.map(t => ({
      ...t,
      qualifications: t.qualifications || "Not specified",
      experience: t.experience || "Not specified"
    }));

    // send to frontend wrapped in "tutors" key
    res.json({ tutors: tutorsWithDefaults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────
// GET TUTOR BY ID
// ─────────────────────────────────────────────
router.get('/tutors/:id', async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────
// GET ALL TUITIONS
// ─────────────────────────────────────────────
router.get('/tuitions', async (req, res) => {
  try {
    const tuitions = await TuitionPost.find().populate('postedBy', 'name email');
    res.json(tuitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────
// GET TUITION BY ID
// ─────────────────────────────────────────────
router.get('/tuitions/:id', async (req, res) => {
  try {
    const tuition = await TuitionPost.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!tuition) {
      return res.status(404).json({ error: "Tuition not found" });
    }

    res.json(tuition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
