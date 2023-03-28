const express = require('express');

const router = express.Router();
const axios = require('axios');
const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;

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
