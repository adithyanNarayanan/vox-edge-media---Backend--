const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// TODO: Add strict adminRoleMiddleware here

router.get('/dashboard', adminController.getDashboardStats);
router.get('/bookings', adminController.getAllBookings);
router.get('/messages', adminController.getAllMessages);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
