const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, count: services.length, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all services (Admin - includes inactive)
// @route   GET /api/admin/services
// @access  Private/Admin
exports.getAllServicesAdmin = async (req, res) => {
    try {
        const services = await Service.find({}).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, count: services.length, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:slug
// @access  Public
exports.getService = async (req, res) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug, isActive: true });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        await service.deleteOne();
        res.json({ success: true, message: 'Service removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
