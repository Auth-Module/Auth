const express = require('express');
const axios = require('axios');

const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { findOrCreateUserBySocialMedia } = require('../../../database/models/user');
const session = require('../../../session/index');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER_URL}/auth/google/redirect`
        },
        (accessToken, refreshToken, profile, done) => {
            axios
                .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`)
                .then((response) => {
                    if (
                        response.data.email === profile.emails[0]?.value &&
                        profile.emails[0]?.verified === true
                    ) {
                        return done(null, {
                            socialId: `G-${profile.id}`,
                            email: response.data.email,
                            socialMedia: 'google',
                            name: profile.displayName,
                            validated: true
                        });
                    }

                    return done('authentication failed', null);
                })
                .catch((err) => done(err, null));
        }
    )
);

router.get(
    '/',
    passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    })
);

router.get(
    '/redirect',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.SERVER_URL}/auth/login`
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
            res.send(err);
            res.redirect('/auth/login');
        }
    }
);

module.exports = router;
