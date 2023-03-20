require('dotenv').config();
const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/auth', (req, res) => {
    res.send('Auth Page');
});
app.use('/auth/microsoft/', require('./auth/microsoft_auth/routes'));

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
