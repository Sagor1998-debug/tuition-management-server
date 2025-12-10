// Reports & Analytics + Transaction History
router.get('/reports', auth, adminOnly, async (req, res) => {
  try {
    // Total earnings
    const totalEarningsResult = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalEarnings = totalEarningsResult[0]?.total || 0;

    // Monthly earnings
    const monthlyEarnings = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidAt' } },
          earnings: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent transaction history with details
    const recentTransactions = await Payment.find()
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('tuition', 'subject class')
      .sort({ paidAt: -1 })
      .limit(50); // last 50 transactions

    // Platform stats
    const stats = {
      totalEarnings,
      totalTransactions: await Payment.countDocuments(),
      totalTuitions: await TuitionPost.countDocuments(),
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalTutors: await User.countDocuments({ role: 'tutor' }),
      pendingTuitions: await TuitionPost.countDocuments({ status: 'pending' }),
      monthlyEarnings,
      recentTransactions // ← THIS IS THE KEY ADDITION
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});