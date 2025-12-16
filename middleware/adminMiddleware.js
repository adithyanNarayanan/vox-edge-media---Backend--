const adminMiddleware = (req, res, next) => {
    // console.log("Admin Middleware Check:");
    // console.log("User:", req.user ? req.user.email : "No User");
    // console.log("Role:", req.user ? req.user.role : "No Role");

    if (req.user && req.user.role === 'admin') {
        return next();
    }

    console.warn(`⛔ Access Denied: User ${req.user ? req.user.email : 'Unknown'} with role ${req.user ? req.user.role : 'Unknown'} attempted to access admin route.`);

    return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
    });
};

module.exports = adminMiddleware;
