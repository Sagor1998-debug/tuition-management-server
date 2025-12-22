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

// CORS
app.use(cors({ origin: true }));

// Fix for Stripe webhook + normal JSON parsing (important for Vercel)
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// Stripe webhook route
app.use('/webhook', webhooksRouter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// GET SINGLE TUTOR BY ID (for TutorProfile page)
app.get('/api/users/:id', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'tutor') {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching tutor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for admin dashboard)
app.get('/api/users/all', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all payments (for admin dashboard)
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

// DEV Routes
app.use('/dev', devRoutes);

// Root test
app.get('/', (req, res) => res.send('Tuition Management Server Running!'));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Auto-create admin (runs once when server starts)
const createAdmin = async () => {
  try {
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'admin'
      });
      console.log('Admin created → admin@example.com / Admin123!');
    }
  } catch (e) {
    console.error('Admin creation error:', e);
  }
};
createAdmin();


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Visit http://localhost:${PORT} in your browser`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });


module.exports = app;