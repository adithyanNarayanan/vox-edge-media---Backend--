const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getAllServicesAdmin
} = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', getServices);
router.get('/:slug', getService);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllServicesAdmin);
router.post('/', authMiddleware, adminMiddleware, createService);
router.put('/:id', authMiddleware, adminMiddleware, updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

module.exports = router;
