const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
    // logger: true,
    // debug: true
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        if (info.accepted.length > 0) {
            console.log("Email accepted by SMTP server:", info.accepted);
        } else {
            console.error("Email not accepted:", info);
            throw error;
        }
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
}

module.exports = sendEmail;
