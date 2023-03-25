const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const sendMail = async (subject, toEmail, htmlContent, textContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: process.env.OUTLOOK_EMAIL_ID,
                pass: process.env.Sssdh123
            }
        });

        const options = {
            from: process.env.OUTLOOK_EMAIL_ID,
            to: toEmail,
            subject,
            text: textContent,
            html: htmlContent
        };

        const status = await transporter.sendMail(options);
        return status.accepted || null;
    } catch (err) {
        console.log(err);
        return null;
    }
};
const signupVerificationEmail = async () => {
    try {
        const subject = 'Email Verification';
        const toEmail = 'subhadipsjsc@gmail.com';
        const htmlContent = await ejs.renderFile(
            path.join(__dirname, 'email_templates/test.ejs'),
            {}
        );
        const textContent = 'create account';
        const status = await sendMail(subject, toEmail, htmlContent, textContent);
        return status;
    } catch (err) {
        console.log(err);
        return null;
    }
};

module.exports = { signupVerificationEmail };
