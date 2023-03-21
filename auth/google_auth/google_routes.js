const express = require('express');

const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google/redirect'
        },
        (accessToken, refreshToken, profile, done) => done(null, profile)
    )
);

router.get('/', passport.authenticate('google', { scope: ['profile'] }));

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
