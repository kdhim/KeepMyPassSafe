// Final Project: KeepMyPassSafe - Encrypted Password Storage App
// kd1621

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
const session = require('express-session');
require('hbs');
require('./db');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
	res.render('index', {});
});

app.set('view engine', 'hbs');

app.listen(3000);