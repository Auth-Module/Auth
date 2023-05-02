const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const sendMail = async (subject, toEmail, htmlContent, textContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: process.env.OUTLOOK_EMAIL_ID,
                pass: process.env.OUTLOOK_PASSWORD
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
const signupVerificationEmail = async (userEmail, validationcode) => {
    try {
        // console.log(userEmail, validationcode);
        if (userEmail && validationcode) {
            const subject = 'Email Verification';
            const toEmail = userEmail;
            const htmlContent = await ejs.renderFile(
                path.join(__dirname, 'template/email_validation_link.ejs'),
                {
                    validationcode
                }
            );
            const textContent = 'create account';
            const status = await sendMail(subject, toEmail, htmlContent, textContent);
            return status;
        }
        return null;
    } catch (err) {
        console.log(err);
        return null;
    }
};

module.exports = { signupVerificationEmail };
