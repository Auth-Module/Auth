const express = require('express');

const router = express.Router();

// ================== Rendering UI pages======================
// 1. Login Page
// 2. Signup Page
// 3. Validation Page
// ===========================================================
router.get('/login', (req, res) => {
    res.render('auth/login', { baseURL: process.env.SERVER_URL });
});

router.get('/signup', (req, res) => {
    res.render('auth/signup', { baseURL: process.env.SERVER_URL });
});

router.get('/validate/:userId', (req, res) => {
    const { userId } = req.params;
    res.render('auth/validate', { baseURL: process.env.SERVER_URL, id: userId });
});

// ========================= APIs ===========================
// 1. email password APIs
// 2. microsoft OAuth APIs
// 3. Google APIs
// ===========================================================
router.use('/email-pass/', require('./email_pass/routes'));
router.use('/microsoft/', require('./microsoft_auth/microsoft_routes'));
router.use('/google/', require('./google_auth/google_routes'));

module.exports = router;
