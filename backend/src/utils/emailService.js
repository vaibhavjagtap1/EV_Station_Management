const nodemailer = require('nodemailer');

/**
 * Create reusable transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 */
exports.sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'EV Charging - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">⚡ EV Charging System</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">Password Reset Request</h2>
          <p style="color: #4b5563;">You requested a password reset. Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Or copy this URL: <br/><a href="${resetUrl}" style="color: #10b981;">${resetUrl}</a></p>
          <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);
};

/**
 * Send booking confirmation email
 */
exports.sendBookingConfirmation = async (to, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'EV Charging - Booking Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">⚡ EV Charging System</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">Booking Confirmed! ✅</h2>
          <p style="color: #4b5563;">Your EV charging slot has been booked successfully.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Station:</strong> ${bookingDetails.stationName}</p>
            <p><strong>Slot:</strong> ${bookingDetails.slotNumber}</p>
            <p><strong>Vehicle:</strong> ${bookingDetails.vehicleType}</p>
            <p><strong>Start Time:</strong> ${new Date(bookingDetails.scheduledStart).toLocaleString()}</p>
            <p><strong>End Time:</strong> ${new Date(bookingDetails.scheduledEnd).toLocaleString()}</p>
            <p><strong>Estimated Cost:</strong> ₹${bookingDetails.estimatedCost}</p>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Thank you for using EV Charging System!</p>
        </div>
      </div>
    `,
  };

  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);
};
