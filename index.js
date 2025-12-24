require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const tuitionRoutes = require('./routes/tuitions');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const webhooksRouter = require('./routes/webhooks');
const devRoutes = require('./routes/dev');

const app = express();

/* =========================
   CORS CONFIGURATION
========================= */
app.use(cors({
  origin: ['http://localhost:5173', 'https://luminous-frangollo-b6b2d3.netlify.app'],
  credentials: true
}));



/* =========================
   BODY PARSING & STRIPE WEBHOOK FIX
========================= */
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

/* =========================
   ROUTES
========================= */
app.use('/webhook', webhooksRouter);

app.use('/api/auth', authRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/dev', devRoutes);

// GET SINGLE TUTOR BY ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.params.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'tutor') return res.status(404).json({ message: 'Tutor not found' });

    res.json(user);
  } catch (err) {
    console.error('Error fetching tutor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin)
app.get('/api/users/all', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all payments (admin)
app.get('/api/payments/all', async (req, res) => {
  try {
    const Payment = require('./models/Payment');
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Root test
app.get('/', (req, res) => {
  res.send('Tuition Management Server Running!');
});

/* =========================
   DATABASE CONNECTION + SERVER
========================= */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // ✅ AUTO-CREATE ADMIN (SAFE)
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'admin'
      });
      console.log('Admin created');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

module.exports = app;
