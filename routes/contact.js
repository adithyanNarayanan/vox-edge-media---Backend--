const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.post('/', contactController.submitContact);

// Protected routes (Admin)
router.get('/', authMiddleware, contactController.getAllMessages);

module.exports = router;
