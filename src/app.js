// Final Project: KeepMyPassSafe - Encrypted Password Storage App
// kd1621
//
// kd1621: linserv1.cims.nyu.edu ... port 18657
// password: utQX6Lap

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

app.post('/', (req, res) => {
	const key = sanitize(req.body.key);
});

app.set('view engine', 'hbs');

app.listen(process.env.port || 3000);