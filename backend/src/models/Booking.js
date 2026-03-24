const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingStation',
      required: true,
    },
    slotId: {
      type: String,
      required: true,
    },
    slotNumber: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['2W', '3W', '4W', 'HV'],
      required: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    scheduledStart: {
      type: Date,
      required: true,
    },
    scheduledEnd: {
      type: Date,
      required: true,
    },
    actualStart: {
      type: Date,
    },
    actualEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    energyConsumed: {
      type: Number,
      default: 0, // kWh
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    connectorType: {
      type: String,
      enum: ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'GB/T'],
    },
    notes: {
      type: String,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
