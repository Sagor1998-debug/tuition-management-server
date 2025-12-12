// seed.js — FIXED VERSION (Uses passwords from data.json)
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const TuitionPost = require('./models/TuitionPost');

// Load data.json
const dataPath = path.join(__dirname, 'data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(rawData);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear old data
    await User.deleteMany({});
    await TuitionPost.deleteMany({});
    console.log('Cleared old data');

    // Insert Students (hash password from JSON)
    const students = await Promise.all(
      data.students.map(async s => ({
        ...s,
        password: await bcrypt.hash(s.password, 10)
      }))
    );

    const insertedStudents = await User.insertMany(students);
    console.log(`Inserted ${insertedStudents.length} students`);

    // Insert Tutors (hash password from JSON)
    const tutors = await Promise.all(
      data.tutors.map(async t => ({
        ...t,
        password: await bcrypt.hash(t.password, 10),
        qualifications: t.qualifications,
        experience: t.experience
      }))
    );

    const insertedTutors = await User.insertMany(tutors);
    console.log(`Inserted ${insertedTutors.length} tutors`);

    // Insert Tuitions
    const tuitions = data.tuitions.map(tuition => ({
      ...tuition,
      postedBy: insertedStudents[Math.floor(Math.random() * insertedStudents.length)]._id,
      status: Math.random() > 0.3 ? 'approved' : 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await TuitionPost.insertMany(tuitions);
    console.log(`Inserted ${tuitions.length} tuition posts`);

    console.log('SEEDING COMPLETE! All passwords loaded from data.json');
    process.exit(0);

  } catch (error) {
    console.error('SEEDING FAILED:', error.message);
    process.exit(1);
  }
}

seed();
