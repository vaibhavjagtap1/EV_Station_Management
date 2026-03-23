const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  toggleUserStatus,
  updatePricing,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/pricing', updatePricing);

module.exports = router;
