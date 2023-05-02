const express = require('express');

const router = express.Router();
const axios = require('axios');
const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { findOrCreateUserBySocialMedia } = require('../../../database/models/user');
const session = require('../../../session/index');

passport.use(
    new MicrosoftStrategy(
        {
            callbackURL: `${process.env.SERVER_URL}/auth/microsoft/redirect`,
            clientID: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            scope: ['user.read']
        },
        (accessToken, refreshToken, profile, done) => {
            // curl -i -H "Authorization: Bearer ACCESS_TOKEN"
            axios
                .get('https://graph.microsoft.com/v1.0/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                .then((response) => {
                    const microsoftUserId = response.data.id;
                    const passportUserId = profile.id;
                    if (microsoftUserId === passportUserId) {
                        const passportUserEmail = profile.emails && profile.emails[0].value;
                        return done(null, {
                            socialId: `M-${microsoftUserId}`,
                            email: passportUserEmail,
                            socialMedia: 'microsoft',
                            validated: true
                        });
                    }
                    return done('Auth Invalid', null);
                })
                .catch((err) => done(err, null));
        }
    )
);

router.get('/', passport.authenticate('microsoft', { session: false }));

router.get(
    '/redirect',
    passport.authenticate('microsoft', {
        session: false,
        failureRedirect: `${process.env.SERVER_URL}/auth`
    }),
    async (req, res) => {
        try {
            const user = await findOrCreateUserBySocialMedia(req.user);
            // data to save in Session
            const sessionUserData = {
                userId: user.id,
                role: user.role,
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
                res.redirect('/');
            }
            // if we choose simple cookie
            else if (process.env.SESSION_TOKEN === 'cookie') {
                res.cookie('auth_session', sessionToken, {});
                res.redirect('/');
            } else {
                res.redirect('/');
            }
        } catch (err) {
            console.log('error', err);
            res.redirect('/auth/login');
        }
    }
);

module.exports = router;
