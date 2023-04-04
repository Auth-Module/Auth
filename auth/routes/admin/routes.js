const express = require('express');

const router = express.Router();
const proxyURLError = require('../../helper/validateProxy');
const proxy = require('../../../proxy/index');

router.get('/proxy', async (req, res) => {
    try {
        const proxyValue = proxy.getProxy();
        if (proxyValue) {
            res.send({ success: 1, proxyValue });
        } else {
            res.status(401).send({ success: 0 });
        }
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});
router.put('/proxy', async (req, res) => {
    try {
        const proxyError = proxyURLError.checkProxy(req.body);
        if (proxyError) {
            res.status(401).send(proxyError);
        } else {
            const status = proxy.updateProxy(req.body);
            if (status) {
                res.send({ success: 1 });
            } else {
                res.status(401).send({ success: 0 });
            }
        }
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});

module.exports = router;
