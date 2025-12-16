const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Use the hardcoded URI as seen in server.js to ensure connection matches
const mongoUri = 'mongodb+srv://adithyanNarayanan:root@cluster0.nszv8ws.mongodb.net/vox-edge-media?retryWrites=true&w=majority';

const seedAdmin = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('✓ MongoDB Connected');

        const adminEmail = 'admin123@gmail.com';
        const adminPassword = '123456';

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('Admin user found, updating credentials...');
            user.password = adminPassword;
            user.role = 'admin';
            user.displayName = 'Admin User';
            user.emailVerified = true;

            // Explicitly mark password as modified to trigger the pre-save hash
            user.markModified('password');

            await user.save();
            console.log('✓ Admin user updated successfully');
        } else {
            console.log('Creating new admin user...');
            user = await User.create({
                email: adminEmail,
                password: adminPassword,
                displayName: 'Admin User',
                role: 'admin',
                provider: 'email',
                emailVerified: true,
                phoneVerified: true,
                isActive: true
            });
            console.log('✓ Admin user created successfully');
        }

        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        // Close connection
        await mongoose.connection.close();
        process.exit();
    } catch (error) {
        console.error('✗ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
