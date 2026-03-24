const User = require('../models/User');
const ChargingStation = require('../models/ChargingStation');
const Booking = require('../models/Booking');
const Billing = require('../models/Billing');

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStations,
      totalBookings,
      activeBookings,
      revenueData,
      recentBookings,
      stationStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      ChargingStation.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      Billing.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalEnergy: { $sum: '$energyConsumed' },
          },
        },
      ]),
      Booking.find()
        .populate('user', 'name email')
        .populate('station', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      ChargingStation.find({ isActive: true })
        .select('name availableSlots totalSlots totalRevenue totalEnergyDispensed')
        .sort({ totalRevenue: -1 })
        .limit(5),
    ]);

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          energy: { $sum: '$energyConsumed' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalStations,
        totalBookings,
        activeBookings,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalEnergy: revenueData[0]?.totalEnergy || 0,
        recentBookings,
        stationStats,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);
    res.status(200).json({ success: true, count: users.length, total, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (Admin)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin users' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pricing for all stations or a specific station
// @route   PUT /api/admin/pricing
// @access  Private/Admin
exports.updatePricing = async (req, res, next) => {
  try {
    const { stationId, pricePerUnit } = req.body;

    if (stationId) {
      const station = await ChargingStation.findByIdAndUpdate(
        stationId,
        { pricePerUnit },
        { new: true }
      );
      return res.status(200).json({ success: true, station });
    }

    // Update all stations
    await ChargingStation.updateMany({}, { pricePerUnit });
    res.status(200).json({ success: true, message: 'All station prices updated' });
  } catch (error) {
    next(error);
  }
};
