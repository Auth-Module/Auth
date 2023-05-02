const express = require('express');

const router = express.Router();
const validationError = require('../../helper/validateUser');
const { checkUserEmailPass } = require('../../../database/models/user');
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
            } else if (!user.role && !user.role.includes('admin')) {
                res.status(500).send({ error: 'user not admin' });
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

module.exports = router;
