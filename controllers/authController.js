const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../config/jwt');
const crypto = require('crypto');
const OTP = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');

// @desc    Register new user with email/password
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, displayName, phoneNumber } = req.body;

        // Validate required fields
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        if (!email && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            phoneNumber,
            displayName: displayName || email?.split('@')[0] || 'User',
            provider: email ? 'email' : 'phone',
            emailVerified: false,
            phoneVerified: false
        });

        // Generate JWT token
        const token = generateToken(user._id);

        // Set httpOnly cookie for secure token storage
        res.cookie('token', token, {
            httpOnly: true,      // Cannot be accessed by JavaScript (XSS protection)
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',  // CSRF protection
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token, // Also send in response for localStorage fallback
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                displayName: user.displayName,
                provider: user.provider,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        if (!email && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required'
            });
        }

        // Build query based on provided email or phone
        const query = {};
        if (email) {
            query.email = email.toLowerCase();
        } else if (phoneNumber) {
            query.phoneNumber = phoneNumber;
        }

        // Find user and include password for comparison
        /** @type {any} */
        const user = await User.findOne(query).select('+password');

        if (!user) {
            // Check if it is an admin login
            /** @type {any} */
            const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

            if (admin) {
                // Verify admin password
                const isMatch = await admin.comparePassword(password);
                if (isMatch) {
                    // Generate JWT token
                    const token = generateToken(admin._id);

                    // Set httpOnly cookie
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 30 * 24 * 60 * 60 * 1000
                    });

                    return res.json({
                        success: true,
                        message: 'Admin login successful',
                        token,
                        user: {
                            id: admin._id,
                            email: admin.email,
                            role: admin.role,
                            displayName: 'Admin'
                        }
                    });
                }
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account is blocked. Please contact admins at support@voxedgemedia.com'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        // Set httpOnly cookie for secure token storage
        res.cookie('token', token, {
            httpOnly: true,      // Cannot be accessed by JavaScript (XSS protection)
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',  // CSRF protection
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            success: true,
            message: 'Login successful',
            token, // Also send in response for localStorage fallback
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: user.provider,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Check if email is available for registration
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists with this email
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.json({
                success: true,
                available: false,
                message: 'This email is already registered'
            });
        }

        res.json({
            success: true,
            available: true,
            message: 'Email is available'
        });
    } catch (error) {
        console.error('Check email availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error checking email availability'
        });
    }
};

// @desc    Send OTP to email
// @route   POST /api/auth/email/send-otp
// @access  Public
exports.sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // ✅ CHECK: Prevent sending OTP if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            console.log(`❌ OTP request blocked: Email already exists - ${email}`);
            return res.status(400).json({
                success: false,
                message: 'This email already exists. Use another email to sign up.'
            });
        }

        console.log(`✅ Email available, generating OTP for ${email}`);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const message = `Your OTP for verification is: ${otp}`;

        try {
            await sendEmail({
                email,
                subject: 'Verification Code - Vox Edge Media',
                message,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Verification Code</h2>
                        <p>Your OTP for Vox Edge Media is:</p>
                        <h1 style="color: #4a90e2; letter-spacing: 5px;">${otp}</h1>
                        <p>This code will expire in 5 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                    </div>
                `
            });

            console.log(`OTP sent to ${email}`);

            res.json({
                success: true,
                message: 'OTP sent successfully to email',
                email
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);

            // Fallback for development/error cases
            console.log('---------------------------------------------------');
            console.log('🚧 EMAIL SERVICE ERROR - FALLBACK MODE 🚧');
            console.log(`To: ${email}`);
            console.log(`OTP: ${otp}`);
            console.log('---------------------------------------------------');

            // Allow workflow to continue even if email fails
            return res.json({
                success: true,
                message: 'Development Mode: Email failed to send (check console for OTP)',
                devOTP: otp
            });
        }

    } catch (error) {
        console.error('Send Email OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
};

// @desc    Verify OTP and register/login user via Email
// @route   POST /api/auth/email/verify-otp
// @access  Public
exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp, displayName, password, phoneNumber } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Verify OTP from database
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            console.log(`❌ OTP Verification Failed: No OTP found for ${email}`);
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new one.'
            });
        }

        if (otpRecord.otp !== otp) {
            console.log(`❌ OTP Verification Failed: Incorrect OTP for ${email}`);
            console.log(`   Expected: ${otpRecord.otp}`);
            console.log(`   Received: ${otp}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // ✅ OTP is CORRECT! Proceed with account creation
        console.log(`✅ OTP VERIFIED SUCCESSFULLY for ${email}`);
        console.log(`   OTP Matched: ${otp}`);

        // Delete OTP after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });
        console.log(`   OTP deleted from database`);

        console.log(`Verifying OTP for email: ${email}`);

        // Phone uniqueness check removed to allow multiple accounts per number

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            console.log("User not found via email, attempting to create new user...");
            // New user registration
            const userData = {
                email,
                displayName: displayName || email.split('@')[0],
                provider: 'email',
                emailVerified: true,
                photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${displayName || email}`
            };

            if (phoneNumber) {
                userData.phoneNumber = phoneNumber;
                userData.phoneVerified = true; // Assuming trust for now or verify later
            }
            if (password) {
                userData.password = password;
            }

            try {
                user = await User.create(userData);
                console.log("✅ NEW USER CREATED SUCCESSFULLY!");
                console.log("   User ID:", user._id);
                console.log("   Email:", user.email);
                console.log("   Display Name:", user.displayName);
                console.log("   Phone Number:", user.phoneNumber || "Not provided");
                console.log("   Provider:", user.provider);
            } catch (createErr) {
                console.error("Error creating user in DB:", createErr);
                // Handle duplicate key error specifically usually 11000
                if (createErr.code === 11000) {
                    return res.status(400).json({
                        success: false,
                        message: 'This email already exists. Use another email to sign up.'
                    });
                }
                throw createErr;
            }
        } else {
            // ❌ User already exists - this is a signup flow, not login
            console.log("❌ User already exists, cannot signup with this email:", user._id);
            return res.status(400).json({
                success: false,
                message: 'This email already exists. Use another email to sign up.'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Set httpOnly cookie for secure token storage
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Determine if this was a new registration or existing user
        const isNewUser = !user.lastLogin || (new Date().getTime() - new Date(user.lastLogin).getTime()) < 1000;

        res.json({
            success: true,
            message: user.createdAt && (new Date().getTime() - new Date(user.createdAt).getTime()) < 5000
                ? 'Account created successfully! Please login with your credentials.'
                : 'Email verified successfully!',
            token, // Also send in response for localStorage fallback
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: user.provider,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'OTP verification failed'
        });
    }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
    try {
        const { email, displayName, photoURL, googleId } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({
                success: false,
                message: 'Email and Google ID are required'
            });
        }

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                displayName: displayName || email.split('@')[0],
                photoURL,
                provider: 'google',
                emailVerified: true
            });
        } else {
            // Update user info from Google
            user.displayName = displayName || user.displayName;
            user.photoURL = photoURL || user.photoURL;
            user.emailVerified = true;
            user.lastLogin = new Date();
            await user.save();
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Google authentication successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: user.provider,
                emailVerified: user.emailVerified,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = req.user; // Set by authMiddleware

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: user.provider,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { displayName, photoURL } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (displayName) user.displayName = displayName;
        if (photoURL) user.photoURL = photoURL;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        /** @type {any} */
        const user = await User.findById(req.user._id).select('+password');

        if (!user || !user.password) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change password for this account type'
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // Clear the httpOnly cookie
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0 // Expire immediately
        });

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};
