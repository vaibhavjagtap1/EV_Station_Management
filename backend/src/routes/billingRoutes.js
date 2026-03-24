const express = require('express');
const router = express.Router();
const {
  getMyBilling,
  getBill,
  getEnergyAnalytics,
  getAllBilling,
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyBilling);
router.get('/analytics', getEnergyAnalytics);
router.get('/:id', getBill);

// Admin routes
router.get('/', authorize('admin'), getAllBilling);

module.exports = router;
