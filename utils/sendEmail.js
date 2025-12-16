const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST?.trim(),
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL?.trim(),
                pass: process.env.SMTP_PASSWORD?.trim()
            }
        });

        const message = {
            from: `${process.env.FROM_NAME || 'Vox Edge Media'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        const info = await transporter.sendMail(message);

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
