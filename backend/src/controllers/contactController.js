const Contact = require('../models/Contact');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const contact = await Contact.create({ name, email, phone, subject, message });
    res.status(201).json({
      success: true,
      message: 'Your message has been sent. We will get back to you soon!',
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact submissions (Admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);
    res.status(200).json({ success: true, count: contacts.length, total, contacts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact status (Admin)
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContact = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const update = { status };
    if (adminReply) {
      update.adminReply = adminReply;
      update.repliedAt = new Date();
    }

    const contact = await Contact.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.status(200).json({ success: true, contact });
  } catch (error) {
    next(error);
  }
};
