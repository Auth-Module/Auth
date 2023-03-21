/* eslint-disable eqeqeq */
const express = require('express');
const axios = require('axios');
const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;

const router = express.Router();

passport.use(
    new MicrosoftStrategy(
        {
            callbackURL: `http://localhost:3000/auth/microsoft/redirect`,
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
                    if (microsoftUserId == passportUserId) {
                        const passportUserEmail = profile.emails && profile.emails[0].value;
                        return done(null, { userId: microsoftUserId, email: passportUserEmail });
                    }
                    return done('Auth Invalid', null);
                })
                .catch((err) => {
                    console.log(err);
                    return done('Auth Invalid', null);
                });
        }
    )
);

router.get('/', passport.authenticate('microsoft', { session: false }));

router.get(
    '/redirect',
    passport.authenticate('microsoft', {
        session: false,
        failureRedirect: `http://localhost:3000/auth`
    }),
    (req, res) => {
        try {
            res.send(req.user);
        } catch (err) {
            console.log('error', err);
            res.send('login again');
        }
    }
);

module.exports = router;
