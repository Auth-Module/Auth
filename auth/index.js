const express = require('express');

const router = express.Router();

// rendering login page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// rendering registration page
router.get('/signup', (req, res) => {
    res.render('auth/signup');
});

// username and password auth
router.use('/email-pass/', require('./routes/email_pass/routes'));
// social media logins are validated by below mentioned routes
router.use('/microsoft/', require('./routes/microsoft_auth/microsoft_routes'));
router.use('/google/', require('./routes/google_auth/google_routes'));

module.exports = router;
