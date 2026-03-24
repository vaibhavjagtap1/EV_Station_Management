const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Send token response with cookie
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      vehicleType: user.vehicleType,
      totalEnergyConsumed: user.totalEnergyConsumed,
      totalAmountSpent: user.totalAmountSpent,
    },
  });
};

module.exports = { generateToken, sendTokenResponse };
