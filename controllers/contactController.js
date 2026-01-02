const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        console.log('Submit Contact Request Body:', req.body);
        const { name, email, phone, subject, message } = req.body;

        const contactData = {
            name,
            email,
            phone,
            subject: subject || 'New Inquiry',
            message
        };
        console.log('Creating contact with data:', contactData);

        const contact = await Contact.create(contactData);
        console.log('Contact created successfully:', contact._id);

        // Email content
        const emailMessage = `
            You have received a new contact message:
            
            Name: ${name}
            Email: ${email}
            Phone: ${phone || 'Not provided'}
            Subject: ${subject || 'New Inquiry'}
            Message: ${message}
        `;

        const htmlMessage = `
            <h3>You have received a new contact message:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject || 'New Inquiry'}</p>
            <p><strong>Message:</strong> ${message}</p>
        `;

        try {
            console.log('Attempting to send email...');
            await sendEmail({
                email: 'adithyan.narayanan@orbitcoders.com',
                subject: `New Contact Message from ${name}`,
                message: emailMessage,
                html: htmlMessage
            });
            console.log('Notification email sent successfully');
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);

            // Check for specific Gmail authentication error
            if (emailError.response && emailError.response.includes('535-5.7.8')) {
                return res.status(500).json({
                    message: 'Email authentication failed. If you are using Gmail, you MUST use an App Password, not your login password. Go to Google Account > Security > 2-Step Verification > App Passwords.',
                    error: 'Gmail 535 Authentication Failed',
                    contact
                });
            }

            console.error('Error stack:', emailError.stack);
            // If email is critical, we should return an error
            return res.status(500).json({
                message: 'Message saved but failed to send email notification.',
                error: emailError.message,
                contact
            });
        }

        res.status(201).json({ message: 'Message sent successfully', contact });
    } catch (error) {
        console.error('Detailed Contact submit error:', error);
        res.status(500).json({
            message: 'Server error submitting message',
            error: error.message
        });
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
