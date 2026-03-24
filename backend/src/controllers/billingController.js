const Billing = require('../models/Billing');
const Booking = require('../models/Booking');

// @desc    Get billing history for logged-in user
// @route   GET /api/billing/my
// @access  Private
exports.getMyBilling = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const bills = await Billing.find({ user: req.user.id })
      .populate('station', 'name address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Billing.countDocuments({ user: req.user.id });

    // Aggregate stats
    const stats = await Billing.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalEnergy: { $sum: '$energyConsumed' },
          totalAmount: { $sum: '$totalAmount' },
          totalSessions: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: bills.length,
      total,
      stats: stats[0] || { totalEnergy: 0, totalAmount: 0, totalSessions: 0 },
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill
// @route   GET /api/billing/:id
// @access  Private
exports.getBill = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('station', 'name address contactNumber')
      .populate('user', 'name email phone');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Get energy usage data for charts (daily/weekly)
// @route   GET /api/billing/analytics
// @access  Private
exports.getEnergyAnalytics = async (req, res, next) => {
  try {
    const { period = 'weekly' } = req.query;
    const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userId = req.user._id;

    // Group by day
    const energyData = await Billing.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalEnergy: { $sum: '$energyConsumed' },
          totalAmount: { $sum: '$totalAmount' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Format data for Chart.js
    const formatted = energyData.map((d) => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
      energy: Math.round(d.totalEnergy * 100) / 100,
      amount: Math.round(d.totalAmount * 100) / 100,
      sessions: d.sessions,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills (Admin)
// @route   GET /api/billing
// @access  Private/Admin
exports.getAllBilling = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId, stationId } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (stationId) filter.station = stationId;

    const bills = await Billing.find(filter)
      .populate('user', 'name email')
      .populate('station', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Billing.countDocuments(filter);

    // Revenue stats
    const revenueStats = await Billing.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalEnergy: { $sum: '$energyConsumed' },
          totalBills: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: bills.length,
      total,
      stats: revenueStats[0] || { totalRevenue: 0, totalEnergy: 0, totalBills: 0 },
      bills,
    });
  } catch (error) {
    next(error);
  }
};
