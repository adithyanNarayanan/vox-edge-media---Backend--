const Booking = require('../models/Booking');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });

        // Calculate total revenue
        const revenueAgg = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'displayName email');

        res.json({
            stats: {
                totalBookings,
                pendingBookings,
                completedBookings,
                totalRevenue
            },
            recentBookings
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 })
            .populate('user', 'displayName email');

        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all messages (Admin)
// @route   GET /api/admin/messages
// @access  Private (Admin)
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
