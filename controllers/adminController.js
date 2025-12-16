const Booking = require('../models/Booking');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Service = require('../models/Service');
const Plan = require('../models/Plan');
const Content = require('../models/Content');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        // Bookings Stats
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });

        // User Stats
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        // Content Management Stats
        const totalServices = await Service.countDocuments();
        const totalPlans = await Plan.countDocuments();

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
            success: true,
            stats: {
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    completed: completedBookings,
                    revenue: totalRevenue
                },
                users: {
                    total: totalUsers,
                    admins: totalAdmins
                },
                content: {
                    services: totalServices,
                    plans: totalPlans
                }
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

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = req.body.role || user.role;
        user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

        // Prevent changing own role if you are the only admin or something logic can be added here

        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();

        res.json({ success: true, message: 'User removed' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};
