const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
    try {
        let token = null;

        // ✅ Method 1: Check Authorization header first (Explicit client intent)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
            console.log('📋 Token retrieved from Authorization header');
        }

        // ✅ Method 2: Fallback to cookie if no header
        if (!token && req.headers.cookie) {
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
            // Check if it's an admin
            const admin = await Admin.findById(decoded.id).select('-password');

            if (admin) {
                req.user = admin;
                console.log(`✅ Admin authenticated: ${admin.email}`);
                return next();
            }

            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.'
            });
        }

        if (user.isActive === false) { // Explicit check as undefined/null shouldn't block admins
            return res.status(401).json({
                success: false,
                message: 'Your account is blocked. Please contact admins at support@voxedgemedia.com'
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
