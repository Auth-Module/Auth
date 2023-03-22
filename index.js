require('dotenv').config();
const express = require('express');

const app = express();

app.use('/static', express.static('static'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('ping');
});

app.get('/auth', (req, res) => {
    res.render('auth/index');
});
app.use('/auth/microsoft/', require('./auth/microsoft_auth/microsoft_routes'));
app.use('/auth/google/', require('./auth/google_auth/google_routes'));

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
