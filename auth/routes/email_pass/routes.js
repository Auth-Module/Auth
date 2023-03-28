const express = require('express');

const router = express.Router();
router.use(express.json());

const {
    createUserByPassword,
    findUserById,
    markUservalidated
} = require('../../database/models/user');
const validationError = require('../../helper/validateUser');
const { Sha512Encryption } = require('../../helper/encryption');
const { signupVerificationEmail } = require('../../mailer/mailer');

router.post('/signup', async (req, res) => {
    try {
        const validationerror = validationError.registration(req.body);
        if (validationerror) {
            res.status(401).send(validationerror);
        } else {
            const user = await createUserByPassword(req.body);
            if (user.errorMsg) {
                res.status(500).send(user);
            } else {
                res.send(user);
            }
        }
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});

router.get('/send-email-code/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId);
        const validationerror = validationError.isNumber(userId);
        if (validationerror) {
            res.status(401).send(validationerror);
        } else {
            const user = await findUserById(userId);
            if (user.errorMsg) {
                res.status(500).send(user.errorMsg);
            } else {
                const data = user.id + user.email;
                const validationCode = Sha512Encryption(
                    data,
                    process.env.EMAIL_CODE_ENCRYPTION,
                    process.env.EMAIL_CODE_ENCRYPTION_ROUND
                );
                const validationLink = `${process.env.SERVER_URL}/auth/email-pass/validate-email/${userId}/${validationCode}`;
                const status = await signupVerificationEmail(user.email, validationLink);
                res.send(status);
            }
        }
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});

router.get('/validate-email/:userId/:code', async (req, res) => {
    try {
        let validationStatus = 'validation failed';
        const { userId, code } = req.params;
        const validationerror = validationError.isNumber(userId);
        if (!validationerror) {
            const user = await findUserById(userId);
            if (!user.errorMsg) {
                const data = user.id + user.email;
                const validationCode = Sha512Encryption(
                    data,
                    process.env.EMAIL_CODE_ENCRYPTION,
                    process.env.EMAIL_CODE_ENCRYPTION_ROUND
                );
                if (code === validationCode) {
                    const markValidated = await markUservalidated(userId);
                    if (markValidated) {
                        validationStatus = 'validation successfully done';
                    }
                }
            }
        }
        res.render('auth/validationStatus', {
            baseURL: process.env.SERVER_URL,
            validationStatus
        });
    } catch (err) {
        console.log('error', err);
        res.render('auth/validationStatus', {
            baseURL: process.env.SERVER_URL,
            validationStatus: 'validation failed'
        });
    }
});

module.exports = router;
