const Contact = require('../models/Contact');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({ message: 'Message sent successfully', contact });
    } catch (error) {
        console.error('Contact submit error:', error);
        res.status(500).json({ message: 'Server error submitting message' });
    }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private (Admin)
exports.getAllMessages = async (req, res) => {
    try {
        // TODO: Add admin check
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};
