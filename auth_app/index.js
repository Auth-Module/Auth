require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const app = express();


// ================ cookie parser =======================
// setting up cookie parser to get session cookie
// ======================================================
app.use(cookieParser());

// ================= client side css,js, HTML ==============
// static files and view engine
// ========================================================
app.use('/static', express.static(path.join(__dirname, '/server/auth/static')));
app.set('views', path.join(__dirname, '/server/auth/templates'));
app.set('view engine', 'ejs');

// ======================== Auth ==========================
// Auth related routes , model , helper
// =======================================================
app.use('/auth', require('./server/auth/index'));

// =================== API Forwarding =======================
// checking if session is not available , redirect to login page
// if session available , then forward the call
// ===========================================================
const session = require('./server/session/index');
const proxy = require('./server/proxy/index');

app.get('/*', async (req, res) => {
    try {
        const sessionCookie = req.cookies.auth_session;
        const sessionUser = session.getSessionUser(sessionCookie);
        if (!sessionUser) {
            res.redirect('/auth/login');
        } else {
            const proxyData = proxy.proxyURLRewrite(req.url);
            console.log(proxyData)
            if (proxyData) {
                const isScoped =
                    proxyData && proxyData.scope.some((v) => sessionUser.role.indexOf(v) !== -1);
                if (!isScoped) {
                    res.send({ status: 'not authorized' });
                } else if (proxyData.url) {
                    const responseData = await axios({
                        method: req.method,
                        url: proxyData.url,
                        transformResponse: (r) => r,
                        responseType: 'text',
                        timeout: 10000,
                        headers: req.headers
                    });
                    if (responseData.data) {
                        res.send(responseData.data);
                    } else {
                        res.send({ status: 'no data found' });
                    }
                } else {
                    res.send({ error: 'Page not found' });
                }
            } else {
                res.send({ error: 'URL not found' });
            }
        }
    } catch (error) {
        if (error.response) {
            console.log("error data",error.response.data);
            console.log("error status",error.response.status);
            console.log("error headers",error.response.headers);
        } else if (error.request) {
            console.log("error request",error.request);
        } else {
            console.log('Error', error.message);
        }
        res.send({ error: 'Routing call error' });
    }
});


// ========================== Server setup =======================
// setting up server according to port
// ===============================================================
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});

// ================ connecting DB =======================
// the connction file is inside auth/databse folder
// ======================================================
const { connectDB, loadDB } = require('./server/database/startDB');

// ================== Wait fro 10 second to on the Db ===============//

setTimeout(()=>{
    connectDB();
    loadDB();  
} , 2000)




