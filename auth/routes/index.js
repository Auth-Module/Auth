const express = require('express');
const session = require('../../session/index');

const router = express.Router();

//= ================== Auth Home Page =========================
router.get('/', (req, res) => {
    const sessionCookie = req.cookies.auth_session;
    const sessionUser = session.getSessionUser(sessionCookie);
    if (sessionUser) {
        res.redirect('/');
    } else {
        res.redirect('/auth/login');
    }
});

router.get('/logout', (req, res) => {
    const sessionCookie = req.cookies.auth_session;
    session.endSession(sessionCookie);
    res.cookie('auth_session', '').redirect('/login');
});

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

// =========================  UI pages  ===========================
// 1. Admin login
// ===========================================================
router.get('/admin/login', (req, res) => {
    res.render('admin/login', { baseURL: process.env.SERVER_URL });
});

router.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard', { baseURL: process.env.SERVER_URL });
});

// ================== Rendering UI pages======================
// 1. admin Login Page
// ===========================================================
router.use('/admin/email-pass/', require('./admin_login/routes'));
router.use('/admin/action/', require('./admin/routes'));

module.exports = router;
