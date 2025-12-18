const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a service title']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please add a short description']
    },
    longDescription: {
        type: String
    },
    icon: {
        type: String
    },
    image: {
        type: String
    },
    features: [{
        type: String
    }],
    startingPrice: {
        type: Number
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

// Create slug from title
serviceSchema.pre('save', async function () {
    if (this.title && !this.slug) {
        this.slug = this.title.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
});

module.exports = mongoose.model('Service', serviceSchema);
