require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const app = express();

// ================ connecting DB =======================
// the connction file is inside auth/databse folder
// ======================================================
const connectDB = require('./auth/database/connectDB');

connectDB();

// ================ cookie parser =======================
// setting up cookie parser to get session cookie
// ======================================================
app.use(cookieParser());

// ================= client side css,js, HTML ==============
// static files and view engine
// ========================================================
app.use('/static', express.static(path.join(__dirname, 'auth/static')));
app.set('views', path.join(__dirname, 'auth/templates'));
app.set('view engine', 'ejs');

// ======================== Auth ==========================
// Auth related routes , model , helper
// =======================================================
app.use('/auth', require('./auth/index'));

// =================== API Forwarding =======================
// checking if session is not available , redirect to login page
// if session available , then forward the call
// ===========================================================
const session = require('./session/index');
const proxy = require('./proxy/index');

app.get('/*', async (req, res) => {
    try {
        const sessionCookie = req.cookies.auth_session;
        const sessionUser = session.getSessionUser(sessionCookie);
        if (!sessionUser) {
            res.redirect('/auth/login');
        } else {
            // const [pathURL, queryParam] = req.url.split('?');
            const proxyURL = proxy.proxyURLRewrite(req.url);
            if (proxyURL) {
                const responseData = await axios({
                    method: req.method,
                    url: proxyURL,
                    transformResponse: (r) => r,
                    responseType: 'text',
                    timeout: 10000,
                    headers: req.headers
                });
                if (responseData.data) {
                    res.send(responseData.data);
                } else {
                    res.send({ status: 'ok' });
                }
            } else {
                res.send({ error: 'Page not found' });
            }
        }
    } catch (error) {
        console.log(error);
        res.send({ error: 'API call error' });
    }
});

// ========================== Server setup =======================
// setting up server according to port
// ===============================================================
const port = process.env.SERVER_PORT || 3000;
// eslint-disable-next-line no-underscore-dangle

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
