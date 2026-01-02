require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('\n--- DIAGNOSTIC EMAIL TEST ---');
    console.log('This script tests your Gmail App Password configuration.\n');

    // 1. Check if env file is read correctly
    const email = process.env.SMTP_EMAIL;
    const rawPassword = process.env.SMTP_PASSWORD;

    if (!email) {
        console.error('❌ Error: SMTP_EMAIL is missing in .env file');
        return;
    }
    if (!rawPassword) {
        console.error('❌ Error: SMTP_PASSWORD is missing in .env file');
        return;
    }

    // 2. Strip spaces (automatically handled by our code now)
    const password = rawPassword.replace(/\s+/g, '');

    console.log(`1. Testing Credentials for: ${email}`);
    console.log(`2. Password Status:`);
    console.log(`   - Raw length: ${rawPassword.length} characters`);
    console.log(`   - Cleaned length: ${password.length} characters (Spaces removed)`);

    // Check specific length for App Passwords (16 chars)
    if (password.length !== 16) {
        console.warn('   ⚠️  WARNING: Google App Passwords are exactly 16 characters.');
        console.warn('      Your password seems to have a different length.');
    } else {
        console.log('   - Format: Correct (16 characters)');
    }

    console.log('\n3. Connecting to Gmail...');

    // 3. Configure Transport (Exact same config as sendEmail.js)
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: email,
            pass: password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.verify();
        console.log('\n✅ SUCCESS! Authentication working.');
        console.log('   - Your App Password is correct.');
        console.log('   - You can now send emails.');
    } catch (error) {
        console.log('\n❌ AUTHENTICATION FAILED');
        console.log(`   Server responded: ${error.response}`);

        if (error.response && error.response.includes('535')) {
            console.log('\n📢 TROUBLESHOOTING:');
            console.log('   The email or password is WRONG. Google rejected it.');
            console.log('   PLEASE CHECK:');
            console.log(`   1. Is the email in .env EXACTLY "${email}"?`);
            console.log('   2. Did you generate the App Password for THIS specific email account?');
            console.log('   3. Try generating a new App Password and pasting it again.');
            console.log('\n   👉 CRITICAL: If you are logged into multiple Google accounts, you might have generated');
            console.log('      the password for the WRONG account. Please check your avatar icon in Google Security settings.');
        }
    }
    console.log('\n-----------------------------------');
};

testEmail();
