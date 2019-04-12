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

// setting up express-session
const sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: false, 
	resave: false 
};
app.use(session(sessionOptions));


const User = mongoose.model('User');
const Folder = mongoose.model('Folder');

function getUser(key){
	User.findOne({"key": key}, function(err, user){
		if (user) {
			console.log('user was found!');
			return user;
		} 
	});
	return null;
}

app.get('/', (req, res) => {
	res.render('index', {});
});

app.post('/', (req, res) => {
	const key = sanitize(req.body.key);

	// we will now check the database to see if there is a User with key
	// if yes, then we will login to that dashboard
	// if not, then we will create a new User and redirect to an empty dashboard

	/*User.findOne({key: key}, function(err, user){
		if (!err && user){
			console.log('user was found!');
			//const folders = user.folders;
			req.session.user = user;
			res.redirect('/dashboard');
		} else {
			if (err){
				console.log(err);
			} else {
				new User({
					key: key
				}).save(function(err){
					res.redirect('/dashboard');
				});
			}
		}
	});*/

	const user = getUser(key);
	if (user) {
		req.session.key = key; // set the session key
	} else {
		// create the user
		new User({
			key: key
		}).save(function(err){
			res.redirect('/dashboard');
		});
	}
	res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
	const user = getUser(req.session.key);

	if (user){
		const folders = user.folders; 
		if (folders){
			console.log("This session user " + req.session.user.key + " has folders");
			console.log(folders);
		}
		res.render('dashboard', {folders: folders});
	} else {

	}
	res.render('dashboard', {folders: folders});
});

app.post('/dashboard', (req, res) => {
	const fname = sanitize(req.body.folderName);
	new Folder({
		name: fname
	}).save(function(err, folder){
		if (err){
			console.log(err);
		} else {
			if (folder){ 
				const user = getUser(req.session.key); // the current user
				user.folders.push(folder); // add this folder to the current user
			} else{
				console.log("unknown error creating the folder");
			}
			res.redirect('/dashboard'); // refresh the page
		}
	});
});

app.set('view engine', 'hbs');

app.listen(process.env.port || 3000);