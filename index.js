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

// Stripe Webhook (must be before express.json())
app.use('/webhook', express.raw({ type: 'application/json' }), webhooksRouter);

// Parse JSON
app.use(express.json());

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

// ADDITIONAL ROUTES FOR ADMIN DASHBOARD STATS (if not in userRoutes/paymentRoutes)

// Get all users (for total users & active tutors count)
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

// Get all payments (for total revenue) - adjust if you have Payment model
app.get('/api/payments/all', async (req, res) => {
  try {
    const Payment = require('./models/Payment'); // change to your actual Payment model path if different
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

// Auto-create admin
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);