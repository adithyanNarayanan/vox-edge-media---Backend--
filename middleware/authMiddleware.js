const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        let token = null;

        // ✅ Method 1: Try to get token from cookie (primary, more secure)
        if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                acc[key] = value;
                return acc;
            }, {});

            if (cookies.token) {
                token = cookies.token;
                console.log('🍪 Token retrieved from cookie');
            }
        }

        // ✅ Method 2: Fallback to Authorization header (for compatibility)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
                console.log('📋 Token retrieved from Authorization header');
            }
        }

        // ❌ No token found in either location
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login.'
            });
        }

        // Verify token

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        if (typeof decoded === 'string') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload.'
            });
        }

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive. Please contact support.'
            });
        }

        // ✅ Attach user to request
        req.user = user;
        console.log(`✅ User authenticated: ${user.email}`);

        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
        });
    }
};

module.exports = authMiddleware;
