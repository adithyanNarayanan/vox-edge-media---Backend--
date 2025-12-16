const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ order: 1, price: 1 });
        res.json({ success: true, count: plans.length, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all plans (Admin)
// @route   GET /api/admin/plans
// @access  Private/Admin
exports.getAllPlansAdmin = async (req, res) => {
    try {
        const plans = await Plan.find({}).sort({ order: 1, price: 1 });
        res.json({ success: true, count: plans.length, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new plan
// @route   POST /api/plans
// @access  Private/Admin
exports.createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        await plan.deleteOne();
        res.json({ success: true, message: 'Plan removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
