const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a plan name']
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    currency: {
        type: String,
        default: 'INR'
    },
    billingCycle: {
        type: String,
        enum: ['hourly', 'daily', 'monthly', 'yearly', 'project'],
        default: 'hourly'
    },
    features: [{
        text: { type: String, required: true },
        included: { type: Boolean, default: true }
    }],
    isPopular: {
        type: Boolean,
        default: false
    },
    buttonText: {
        type: String,
        default: 'Book Now'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
