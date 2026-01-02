const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.error("❌ SMTP_EMAIL or SMTP_PASSWORD is not defined in .env file");
            throw new Error("Missing SMTP credentials");
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD.replace(/\s+/g, ''),
            },
            debug: true,
            logger: true
        });


        const message = {
            from: `${process.env.FROM_NAME || 'Vox Edge Media'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        await transporter.verify();
        console.log("✅ SMTP VERIFIED SUCCESSFULLY");


        const info = await transporter.sendMail(message);

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
