const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register new user with email/password
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user with email/password
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/check-email
// @desc    Check if email is available for registration
// @access  Public
router.post('/check-email', authController.checkEmailAvailability);

// @route   POST /api/auth/email/send-otp
// @desc    Send OTP to email
// @access  Public
router.post('/email/send-otp', authController.sendEmailOTP);

// @route   POST /api/auth/email/verify-otp
// @desc    Verify OTP and register/login user
// @access  Public
router.post('/email/verify-otp', authController.verifyEmailOTP);

// @route   POST /api/auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post('/google', authController.googleAuth);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, authController.getCurrentUser);

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me', authMiddleware, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authMiddleware, authController.changePassword);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
