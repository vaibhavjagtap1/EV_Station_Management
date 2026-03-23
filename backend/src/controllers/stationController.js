const ChargingStation = require('../models/ChargingStation');

// @desc    Get all active charging stations
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res, next) => {
  try {
    const { city, vehicleType, available } = req.query;
    const filter = { isActive: true };

    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (vehicleType) filter.supportedVehicles = vehicleType;
    if (available === 'true') filter.availableSlots = { $gt: 0 };

    const stations = await ChargingStation.find(filter).select('-slots.currentBookingId');
    res.status(200).json({ success: true, count: stations.length, stations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single charging station
// @route   GET /api/stations/:id
// @access  Public
exports.getStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.status(200).json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby stations using geo-coordinates
// @route   GET /api/stations/nearby
// @access  Public
exports.getNearbyStations = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
    }

    const stations = await ChargingStation.find({
      isActive: true,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000, // convert km to meters
        },
      },
    }).select('-slots.currentBookingId');

    res.status(200).json({ success: true, count: stations.length, stations });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new charging station (Admin only)
// @route   POST /api/stations
// @access  Private/Admin
exports.createStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.create(req.body);
    res.status(201).json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a charging station (Admin only)
// @route   PUT /api/stations/:id
// @access  Private/Admin
exports.updateStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.status(200).json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a charging station (Admin only)
// @route   DELETE /api/stations/:id
// @access  Private/Admin
exports.deleteStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.status(200).json({ success: true, message: 'Station deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update slot status (Admin only)
// @route   PUT /api/stations/:id/slots/:slotId
// @access  Private/Admin
exports.updateSlotStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    const slot = station.slots.id(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    slot.status = status;
    await station.save();

    res.status(200).json({ success: true, station });
  } catch (error) {
    next(error);
  }
};
