const express = require('express');

const router = express.Router();
const proxyURLError = require('../../helper/validateProxy');
const proxy = require('../../../proxy/index');
const editProxy = require('../../helper/editProxyReq');
const { findAllUser, updateUserRole } = require('../../../database/models/user');
const { allLoggedinUsers, modifySessionUser } = require('../../../session/index');

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
        const proxyValue = editProxy(JSON.parse(req.body.proxy));
        const proxyError = proxyURLError.checkProxy(proxyValue);
        if (proxyError) {
            res.status(401).send(proxyError);
        } else {
            const status = await proxy.updateProxy(proxyValue);
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

router.get('/all-user', async (req, res) => {
    try {
        const allUsers = await findAllUser();
        const currentUsers = allLoggedinUsers();
        if (allUsers) {
            res.send({ success: 1, users: allUsers, currentUsers });
        } else {
            res.status(401).send({ success: 0, err: 'no user found' });
        }
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});

router.patch('/user', async (req, res) => {
    try {
        const { id, role } = req.body;
        const userDetails = await updateUserRole(id, role);
        const status = await modifySessionUser(userDetails);
        res.send({ status });
    } catch (err) {
        console.log('error', err);
        res.send({ errorMsg: err.message });
    }
});

module.exports = router;
