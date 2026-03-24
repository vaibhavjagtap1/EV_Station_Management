const mongoose = require('mongoose');

const chargingSlotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true },
  connectorType: {
    type: String,
    enum: ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'GB/T'],
    default: 'Type2',
  },
  powerOutput: { type: Number, default: 7.2 }, // kW
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available',
  },
  currentBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
});

const chargingStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String },
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    slots: [chargingSlotSchema],
    totalSlots: { type: Number, default: 0 },
    availableSlots: { type: Number, default: 0 },
    pricePerUnit: {
      type: Number,
      required: true,
      default: 8, // ₹ per kWh
    },
    supportedVehicles: {
      type: [String],
      enum: ['2W', '3W', '4W', 'HV'],
      default: ['2W', '3W', '4W'],
    },
    amenities: [String],
    operatingHours: {
      open: { type: String, default: '00:00' },
      close: { type: String, default: '23:59' },
      is24Hours: { type: Boolean, default: true },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: '' },
    contactNumber: { type: String },
    totalEnergyDispensed: { type: Number, default: 0 }, // kWh
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geo index for map queries
chargingStationSchema.index({ location: '2dsphere' });

// Auto-calculate totalSlots and availableSlots
chargingStationSchema.pre('save', function (next) {
  this.totalSlots = this.slots.length;
  this.availableSlots = this.slots.filter((s) => s.status === 'available').length;
  next();
});

module.exports = mongoose.model('ChargingStation', chargingStationSchema);
