const express = require('express');
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
            const userId = profile.id;
            const userEmail = profile.emails && profile.emails[0].value;
            console.log('userId', userId);
            console.log('user_email', userEmail);
            return done(null, { userId, userEmail });
        }
    )
);

router.get('/', passport.authenticate('microsoft', { session: false }));
router.get(
    '/redirect',
    passport.authenticate('microsoft', {
        session: false,
        failureRedirect: `https://localhost:3000/auth`
    }),
    (req, res) => {
        res.send(req.user);
    }
);

module.exports = router;
