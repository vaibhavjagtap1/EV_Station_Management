const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  completeBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

// Admin routes
router.put('/:id/complete', authorize('admin'), completeBooking);
router.get('/', authorize('admin'), getAllBookings);

module.exports = router;
