const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database not connected. Please start MongoDB.'
        });
    }
    next();
};

module.exports = dbCheck;
