const express = require('express');
const router = express.Router();
const {
    getContent,
    getAllContentAdmin,
    updateContent,
    deleteContent
} = require('../controllers/contentController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/:key', getContent);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllContentAdmin);
router.post('/', authMiddleware, adminMiddleware, updateContent); // Uses upsert logic
router.delete('/:key', authMiddleware, adminMiddleware, deleteContent);

module.exports = router;
