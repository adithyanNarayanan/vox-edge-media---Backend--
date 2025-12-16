const Booking = require('../models/Booking');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { service, date, startTime, duration, totalPrice, notes } = req.body;

        const booking = await Booking.create({
            user: req.user._id,
            service,
            date,
            startTime,
            duration,
            totalPrice,
            notes
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error creating booking' });
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ date: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ message: 'Server error fetching bookings' });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('user', 'displayName email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Make sure user owns booking or is admin (role check pending)
        if (booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ message: 'Server error fetching booking' });
    }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check user ownership
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(booking);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: 'Server error updating booking' });
    }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check user ownership
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await booking.deleteOne();

        res.json({ message: 'Booking removed' });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ message: 'Server error deleting booking' });
    }
};
