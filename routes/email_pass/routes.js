const express = require('express');

const router = express.Router();
router.use(express.json());

const { createUserByPassword } = require('../../database/models/user');
const validationError = require('../../helper/validateUser');

router.post('/signup', async (req, res) => {
    try {
        const validationerror = validationError.registration(req.body);
        if (validationerror) {
            res.status(401).send(validationerror);
        } else {
            const user = await createUserByPassword(req.body);
            if (user.errorMsg) {
                res.status(500).send(user);
            } else {
                res.send(user);
            }
        }
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});

module.exports = router;
