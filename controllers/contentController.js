const Content = require('../models/Content');

// @desc    Get content by key
// @route   GET /api/content/:key
// @access  Public
exports.getContent = async (req, res) => {
    try {
        const content = await Content.findOne({ key: req.params.key });

        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all content keys (to list available pages in admin)
// @route   GET /api/admin/content
// @access  Private/Admin
exports.getAllContentAdmin = async (req, res) => {
    try {
        const content = await Content.find({}, 'key title updatedAt');
        res.json({ success: true, count: content.length, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update or create content
// @route   POST /api/content
// @access  Private/Admin
exports.updateContent = async (req, res) => {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ success: false, message: 'Content key is required' });
        }

        const content = await Content.findOneAndUpdate(
            { key },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete content
// @route   DELETE /api/content/:key
// @access  Private/Admin
exports.deleteContent = async (req, res) => {
    try {
        const content = await Content.findOneAndDelete({ key: req.params.key });

        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        res.json({ success: true, message: 'Content removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
