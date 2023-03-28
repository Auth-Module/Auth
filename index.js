require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// connecting DB
const connectDB = require('./auth/database/connectDB');

connectDB();

app.use(cookieParser());

// static files and view engine
app.use('/static', express.static(path.join(__dirname, 'auth/static')));
app.set('views', path.join(__dirname, 'auth/templates'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('ping');
});

app.use('/auth', require('./auth/index'));

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
