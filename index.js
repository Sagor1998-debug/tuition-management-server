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

const app = express();

// ──────────────────────────────────────────────────────
// 1. CORS
// ──────────────────────────────────────────────────────
app.use(cors({ origin: true }));

// ──────────────────────────────────────────────────────
// 2. STRIPE WEBHOOK — MUST BE THE VERY FIRST THING
//     (before express.json() so the raw body stays intact)
// ──────────────────────────────────────────────────────
app.use('/webhook', express.raw({ type: 'application/json' }), webhooksRouter);

// ──────────────────────────────────────────────────────
// 3. Now we can safely parse JSON for all other routes
// ──────────────────────────────────────────────────────
app.use(express.json());

// ──────────────────────────────────────────────────────
// 4. All your normal API routes
// ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Test route
app.get('/', (req, res) => res.send('Tuition Management Server Running!'));

// ──────────────────────────────────────────────────────
// MongoDB connection
// ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Auto-create Admin (unchanged)
const User = require('./models/User');
const createAdmin = async () => {
  try {
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

// ──────────────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});