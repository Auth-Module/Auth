const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('auth/index');
});

// social media logins are validated by below mentioned routes
router.use('/microsoft/', require('./routes/microsoft_auth/microsoft_routes'));
router.use('/google/', require('./routes/google_auth/google_routes'));

module.exports = router;
