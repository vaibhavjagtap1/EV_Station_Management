const Booking = require('../models/Booking');
const ChargingStation = require('../models/ChargingStation');
const Billing = require('../models/Billing');
const User = require('../models/User');
const { sendBookingConfirmation } = require('../utils/emailService');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { stationId, slotId, vehicleType, vehicleNumber, scheduledStart, scheduledEnd } = req.body;

    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    if (!station.isActive) {
      return res.status(400).json({ success: false, message: 'Station is not active' });
    }

    const slot = station.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    if (slot.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Slot is not available' });
    }

    // Calculate estimated cost
    const durationHours =
      (new Date(scheduledEnd) - new Date(scheduledStart)) / (1000 * 60 * 60);
    const estimatedEnergy = slot.powerOutput * durationHours;
    const estimatedCost = estimatedEnergy * station.pricePerUnit;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      station: stationId,
      slotId,
      slotNumber: slot.slotNumber,
      vehicleType,
      vehicleNumber,
      scheduledStart,
      scheduledEnd,
      connectorType: slot.connectorType,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
    });

    // Mark slot as occupied
    slot.status = 'occupied';
    slot.currentBookingId = booking._id;
    await station.save();

    // Send confirmation email (non-blocking)
    try {
      await sendBookingConfirmation(req.user.email, {
        stationName: station.name,
        slotNumber: slot.slotNumber,
        vehicleType,
        scheduledStart,
        scheduledEnd,
        estimatedCost: Math.round(estimatedCost * 100) / 100,
      });
    } catch (_emailErr) {
      // Email failure is non-critical
    }

    const populatedBooking = await Booking.findById(booking._id).populate('station', 'name address');
    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('station', 'name address pricePerUnit')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      'station',
      'name address pricePerUnit'
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Users can only see their own bookings; admins can see all
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`,
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up the slot
    const station = await ChargingStation.findById(booking.station);
    if (station) {
      const slot = station.slots.id(booking.slotId);
      if (slot) {
        slot.status = 'available';
        slot.currentBookingId = null;
        await station.save();
      }
    }

    res.status(200).json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a booking session and generate bill
// @route   PUT /api/bookings/:id/complete
// @access  Private/Admin
exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('station');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'active' && booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking cannot be completed' });
    }

    const { energyConsumed } = req.body;
    const actualEnd = new Date();
    const actualStart = booking.actualStart || booking.scheduledStart;
    const durationMinutes = Math.round((actualEnd - actualStart) / (1000 * 60));

    booking.status = 'completed';
    booking.actualEnd = actualEnd;
    booking.energyConsumed = energyConsumed || 0;
    await booking.save();

    // Free up the slot
    const station = booking.station;
    const slot = station.slots.id(booking.slotId);
    if (slot) {
      slot.status = 'available';
      slot.currentBookingId = null;
    }

    // Update station stats
    station.totalEnergyDispensed += energyConsumed || 0;

    const subtotal = (energyConsumed || 0) * station.pricePerUnit;
    const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    station.totalRevenue += totalAmount;
    await station.save();

    // Create billing record
    const user = await User.findById(booking.user);
    const billing = await Billing.create({
      user: booking.user,
      booking: booking._id,
      station: station._id,
      energyConsumed: energyConsumed || 0,
      pricePerUnit: station.pricePerUnit,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount,
      totalAmount,
      chargingDuration: durationMinutes,
      sessionStart: actualStart,
      sessionEnd: actualEnd,
      stationName: station.name,
      stationAddress: `${station.address.street}, ${station.address.city}`,
      vehicleType: booking.vehicleType,
      vehicleNumber: booking.vehicleNumber,
      userName: user ? user.name : '',
      userEmail: user ? user.email : '',
      paymentStatus: 'paid',
      paymentDate: new Date(),
    });

    // Update user stats
    await User.findByIdAndUpdate(booking.user, {
      $inc: { totalEnergyConsumed: energyConsumed || 0, totalAmountSpent: totalAmount },
    });

    res.status(200).json({ success: true, booking, billing });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, stationId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (stationId) filter.station = stationId;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('station', 'name address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);
    res.status(200).json({ success: true, count: bookings.length, total, bookings });
  } catch (error) {
    next(error);
  }
};
