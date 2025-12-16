const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    metaDescription: {
        type: String
    },
    images: [{
        type: String
    }],
    data: {
        type: mongoose.Schema.Types.Mixed, // Flexible structure for non-text content (e.g. contact details, social links)
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
