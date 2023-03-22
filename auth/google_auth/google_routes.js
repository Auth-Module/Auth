const express = require('express');
const axios = require('axios');

const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.PROJECT_BACKEND}/auth/google/redirect`
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
                            userId: profile.id,
                            email: response.data.email,
                            loginBy: 'google'
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
        failureRedirect: 'http://localhost:3000/auth'
    }),
    (req, res) => {
        res.send(req.user);
    }
);

module.exports = router;
