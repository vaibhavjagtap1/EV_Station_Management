const express = require('express');
const router = express.Router();
const {
  getStations,
  getStation,
  getNearbyStations,
  createStation,
  updateStation,
  deleteStation,
  updateSlotStatus,
} = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getStations);
router.get('/nearby', getNearbyStations);
router.get('/:id', getStation);

// Admin only routes
router.post('/', protect, authorize('admin'), createStation);
router.put('/:id', protect, authorize('admin'), updateStation);
router.delete('/:id', protect, authorize('admin'), deleteStation);
router.put('/:id/slots/:slotId', protect, authorize('admin'), updateSlotStatus);

module.exports = router;
