const express = require('express');

const router = express.Router();
const {
    createUserByPassword,
    findUserById,
    markUservalidated,
    checkUserEmailPass
} = require('../../../database/models/user');
const validationError = require('../../helper/validateUser');
const { Sha512Encryption } = require('../../helper/encryption');
const { signupVerificationEmail } = require('../../mailer/mailer');
const session = require('../../../session/index');

router.post('/login', async (req, res) => {
    try {
        const validationerror = validationError.login(req.body);

        if (validationerror) {
            res.status(401).send(validationerror);
        } else {
            const user = await checkUserEmailPass(req.body);
            if (user.errorMsg) {
                res.status(500).send(user);
            } else if (user.invalidMsg) {
                res.send({ validateMsg: user.invalidMsg, id: user.userid });
            } else {
                // data to save in Session
                const sessionUserData = {
                    userId: user.id,
                    role: user.role,
                    userEmail: user.email || '',
                    userName: user.name || ''
                };

                // data to send by response
                const responseUserData = {
                    userId: user.id,
                    userEmail: user.email || '',
                    userName: user.name || ''
                };
                // creating session
                const sessionToken = await session.createSessionUser(sessionUserData);
                // if we choose http only cookie
                const sessionDuration = process.env.SESSION_DURATION_MINUTES || 600;
                if (process.env.SESSION_TOKEN === 'http-only-cookie') {
                    res.cookie('auth_session', sessionToken, {
                        httpOnly: true,
                        maxAge: parseInt(sessionDuration, 10) * 60 * 1000
                    });
                    res.send({ ...responseUserData, sessionToken, success: 1 });
                }
                // if we choose simple cookie
                else if (process.env.SESSION_TOKEN === 'cookie') {
                    res.cookie('auth_session', sessionToken, {});
                    res.send({ ...responseUserData, sessionToken, success: 1 });
                } else {
                    res.send({ ...responseUserData, sessionToken, success: 1 });
                }
            }
        }
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});

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
                res.send({ status });
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
