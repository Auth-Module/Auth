require('dotenv').config();
const express = require('express');

const app = express();

app.use('/static', express.static('static'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('ping');
});

app.use('/auth', require('./auth/index'));

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
