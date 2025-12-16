const express = require('express');
const router = express.Router();
const {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlansAdmin
} = require('../controllers/planController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', getPlans);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllPlansAdmin);
router.post('/', authMiddleware, adminMiddleware, createPlan);
router.put('/:id', authMiddleware, adminMiddleware, updatePlan);
router.delete('/:id', authMiddleware, adminMiddleware, deletePlan);

module.exports = router;
