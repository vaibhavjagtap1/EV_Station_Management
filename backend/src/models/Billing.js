const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingStation',
      required: true,
    },
    billNumber: {
      type: String,
      unique: true,
      required: true,
    },
    energyConsumed: {
      type: Number,
      required: true, // kWh
    },
    pricePerUnit: {
      type: Number,
      required: true, // price at time of charging
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 18, // GST 18%
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cash', 'wallet'],
      default: 'online',
    },
    paymentDate: {
      type: Date,
    },
    chargingDuration: {
      type: Number, // in minutes
      default: 0,
    },
    sessionStart: {
      type: Date,
    },
    sessionEnd: {
      type: Date,
    },
    stationName: {
      type: String, // Denormalized for bill display
    },
    stationAddress: {
      type: String,
    },
    vehicleType: {
      type: String,
    },
    vehicleNumber: {
      type: String,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
  },
  { timestamps: true }
);

// Generate bill number before saving
billingSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const count = await this.constructor.countDocuments();
    this.billNumber = `EVC-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
