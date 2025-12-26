const nodemailer = require('nodemailer')

const sendEmail = async options => {
    const transport = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };

    const transporter = nodemailer.createTransport(transport);

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    try {
        const info = await transporter.sendMail(message);
        console.log('Email sent:', info && (info.messageId || info.response));
        return info;
    } catch (err) {
        console.error('Error sending email:', err && err.message ? err.message : err);
        throw err;
    }
}

module.exports = sendEmail