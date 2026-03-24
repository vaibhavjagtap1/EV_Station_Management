/**
 * Database seeder script
 * Run: node src/scripts/seed.js
 *
 * Seeds the database with:
 * - Admin user
 * - Sample charging stations
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const ChargingStation = require('../models/ChargingStation');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await ChargingStation.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@evcharging.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '9999999999',
    });
    console.log(`Admin created: ${admin.email}`);

    // Create a sample user
    await User.create({
      name: 'Test User',
      email: 'user@evcharging.com',
      password: 'User@123',
      role: 'user',
      phone: '8888888888',
      vehicleType: '4W',
    });
    console.log('Sample user created: user@evcharging.com / User@123');

    // Create sample stations
    const stations = [
      {
        name: 'EV Hub - Koramangala',
        address: { street: '5th Block, 80 Feet Rd', city: 'Bangalore', state: 'Karnataka', zipCode: '560034' },
        location: { type: 'Point', coordinates: [77.6268, 12.9352] },
        pricePerUnit: 8,
        supportedVehicles: ['2W', '3W', '4W'],
        amenities: ['WiFi', 'Restroom', 'Cafe'],
        rating: 4.5,
        totalRatings: 128,
        slots: [
          { slotNumber: 'A1', connectorType: 'Type2', powerOutput: 7.2, status: 'available' },
          { slotNumber: 'A2', connectorType: 'Type2', powerOutput: 7.2, status: 'available' },
          { slotNumber: 'B1', connectorType: 'CCS', powerOutput: 50, status: 'occupied' },
          { slotNumber: 'B2', connectorType: 'CCS', powerOutput: 50, status: 'available' },
        ],
      },
      {
        name: 'Green Charge - Indiranagar',
        address: { street: '100 Feet Road, HAL 2nd Stage', city: 'Bangalore', state: 'Karnataka', zipCode: '560038' },
        location: { type: 'Point', coordinates: [77.6411, 12.9784] },
        pricePerUnit: 9,
        supportedVehicles: ['2W', '4W', 'HV'],
        amenities: ['WiFi', 'Parking'],
        rating: 4.2,
        totalRatings: 87,
        slots: [
          { slotNumber: 'S1', connectorType: 'Type2', powerOutput: 22, status: 'available' },
          { slotNumber: 'S2', connectorType: 'CCS', powerOutput: 60, status: 'available' },
          { slotNumber: 'S3', connectorType: 'CHAdeMO', powerOutput: 50, status: 'maintenance' },
        ],
      },
      {
        name: 'PowerStop - MG Road',
        address: { street: 'MG Road, Near Trinity Circle', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' },
        location: { type: 'Point', coordinates: [77.6066, 12.9752] },
        pricePerUnit: 10,
        supportedVehicles: ['2W', '3W', '4W', 'HV'],
        amenities: ['WiFi', 'Restroom', 'Food Court', 'ATM'],
        rating: 4.8,
        totalRatings: 312,
        slots: [
          { slotNumber: 'P1', connectorType: 'Type2', powerOutput: 7.2, status: 'available' },
          { slotNumber: 'P2', connectorType: 'Type2', powerOutput: 7.2, status: 'available' },
          { slotNumber: 'P3', connectorType: 'CCS', powerOutput: 150, status: 'available' },
          { slotNumber: 'P4', connectorType: 'CCS', powerOutput: 150, status: 'occupied' },
          { slotNumber: 'P5', connectorType: 'CHAdeMO', powerOutput: 50, status: 'available' },
        ],
      },
      {
        name: 'EcoCharge - Whitefield',
        address: { street: 'ITPL Main Road, Whitefield', city: 'Bangalore', state: 'Karnataka', zipCode: '560066' },
        location: { type: 'Point', coordinates: [77.7499, 12.9698] },
        pricePerUnit: 7.5,
        supportedVehicles: ['2W', '4W'],
        amenities: ['Restroom'],
        rating: 3.9,
        totalRatings: 54,
        slots: [
          { slotNumber: 'E1', connectorType: 'Type2', powerOutput: 7.2, status: 'available' },
          { slotNumber: 'E2', connectorType: 'Type2', powerOutput: 7.2, status: 'available' },
        ],
      },
      {
        name: 'Volt Point - Electronic City',
        address: { street: 'Electronics City Phase 1', city: 'Bangalore', state: 'Karnataka', zipCode: '560100' },
        location: { type: 'Point', coordinates: [77.6699, 12.8399] },
        pricePerUnit: 8.5,
        supportedVehicles: ['2W', '3W', '4W', 'HV'],
        amenities: ['WiFi', 'Restroom', 'Parking', 'Security'],
        rating: 4.6,
        totalRatings: 198,
        slots: [
          { slotNumber: 'V1', connectorType: 'CCS', powerOutput: 120, status: 'available' },
          { slotNumber: 'V2', connectorType: 'CCS', powerOutput: 120, status: 'available' },
          { slotNumber: 'V3', connectorType: 'Type2', powerOutput: 22, status: 'available' },
          { slotNumber: 'V4', connectorType: 'Type2', powerOutput: 22, status: 'occupied' },
          { slotNumber: 'V5', connectorType: 'GB/T', powerOutput: 60, status: 'available' },
          { slotNumber: 'V6', connectorType: 'GB/T', powerOutput: 60, status: 'available' },
        ],
      },
    ];

    const createdStations = await ChargingStation.insertMany(stations);
    console.log(`${createdStations.length} stations created`);

    console.log('\n✅ Seeding completed successfully!');
    console.log('─'.repeat(40));
    console.log('Admin login  : admin@evcharging.com / Admin@123');
    console.log('User login   : user@evcharging.com  / User@123');
    console.log('─'.repeat(40));

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
