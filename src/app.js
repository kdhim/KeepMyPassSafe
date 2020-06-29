// Keep My Pass Safe - Encrypted Password Storage App
// Copyright &copy; Kevin Dhimitri 2019

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
const session = require('express-session');
const functions = require('./functions')
const encryption = require('./encryption');
require('hbs');
require('./db');

// launch our express application
const app = express();

// code below handles proper file resource access for the web application in the /public directory
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// setting up express-session to keep login state active
// we only are concerned with users who create accounts, so set saveUnitialized to FALSE
const sessionOptions = { 
	secret: 'secret for signing session id banana apple cars future mars mission tesla', 
	saveUninitialized: false, 
	resave: false 
};
app.use(session(sessionOptions));

// mongo schema models
// User has many Folders, Folder has many Accounts
const User = mongoose.model('User');
const Folder = mongoose.model('Folder');
const Account = mongoose.model('Account');

// code for express routes

// render default page (enter private key to login)
app.get('/', (req, res) => {
	res.render('index', {});
});

// user enters private key
// if it is recognized (Exists in DB), log them into dashboard
// otherwise, create the User, and proceed to dashboard
app.post('/', (req, res) => {
	const key = sanitize(req.body.key);

	User.findOne({key: key}, function(err, user){
		req.session.key = key; // set the session user key

		if (!user) {
			console.log("User not found. Creating New USER " + key);

			const cryptoKey = encryption.generateCryptoKey();
			const obscured = encryption.obscureKey(cryptoKey);

			new User({
				key: key,
				folders: [],
				secureArr: obscured
			}).save(function(err){
				res.redirect('/dashboard');
			});
		} else {
			res.redirect('/dashboard');
		}
	});
});

app.get('/dashboard', (req, res) => {
	User.findOne({key: req.session.key}, function(err, user){
		if (user) {
			const folders = user.folders;
			res.render('dashboard', {folders: folders});
		} else {
			res.redirect('/');
		}
	});
});

// this handles the creation of a new Folder, containing accounts
app.post('/dashboard', (req, res) => {
	const fname = sanitize(req.body.folderName);

	// 1. check if the folder already exists (there is already a folder with the same "fname")
	// 2. if it does not, then create it, and update the dashboard
	// 3. if it does, print out an error
	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			found = functions.findFolder(user, fname);

			if (found){
				console.log('Folder ' + fname + ' already exists for User ' + req.session.key);
				res.render('dashboard', {folders: user.folders, error: 'That folder already exists. Try with a different name.'});
			} else {
				new Folder({
				_id: mongoose.Types.ObjectId(),
				name: fname,
				accounts: []
				}).save(function(err, folder){
					functions.saveFolder(req.session.key, folder, err, () => {
						res.redirect('/dashboard');
				})});
			}
		}
	});
});

// will match /folders/id OR /folders/id/add
// the latter is to display an "add account" modal on the folder view page
app.get('/folders/:id/+(add)?', (req, res) => {
	const id = req.params.id;

	const reqUrl = req.originalUrl;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			const encKey = encryption.unobscureKey(user.secureArr);

			Folder.findOne({_id: id}, function(err, folder){
				if (folder){
					const accData = functions.getAccounts(folder, encKey);

					// if '/add' is in URL, then show the "showAddAcc" module
					if (reqUrl.indexOf("/add") != -1){
						res.render("folder", {folder: folder, accData: accData, showAddAcc: true});
					} else{
						res.render("folder", {folder: folder, accData: accData});
					}
				} else {
					if (err) console.log(err);
					res.render("folder", {});
				}
			});
		} else {
			if (err) console.log(err);
			res.redirect('/');
		}
	});
});

// logs the user out, redirecting back to default page
app.get('/logout', (req, res) => {
	req.session.key = null;
	res.redirect('/');
});

// code for handling the creation of a new account
app.post('/folders/:id/add-account', (req, res) => {
	const accName = req.body.name;
	let userlogin = req.body.userlogin;
	let password = req.body.password;
	const folderId = req.params.id;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user)
		{
			const encKey = encryption.unobscureKey(user.secureArr);
			userlogin = encryption.encryptText(encKey, userlogin);
			password = encryption.encryptText(encKey, password);

			Folder.findOne({_id: folderId}, function(err, folder){
				if (folder)
				{
					const accData = functions.getAccounts(folder, encKey);

					const accsWithName = accData.filter(function(acc){
						if (acc.name === accName){
							return acc;
						}
					});

					// we need to make sure the account name is not already in use. if so, proceed.
					if (accsWithName.length === 0) { 
						new Account({
							name: accName,
							userlogin: userlogin,
							password: password
							}).save(function(err, acc){
								functions.saveAccount(acc, folderId, err, () => {
									res.redirect('/folders/' + folderId + "/");
								});
							});
					} else {
						res.render("folder", {folder: folder, accData: accData, accExistsError: true})
					}
				} 
				else
				{
					res.redirect('/dashboard');
				}
			});
		}
		else {
			if (err) console.log(err);
			res.redirect('/');
		}
	});
});

// this will allow a user to edit an account login/password from the folder dashboard
app.get('/folders/:id/:name/edit', (req, res) => {
	const folderId = req.params.id;
	const accName = req.params.name;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			const encKey = encryption.unobscureKey(user.secureArr);

			Folder.findOne({_id: folderId}, function(err, folder){
				if (folder){
					const accData = functions.getAccounts(folder, encKey); // get list of accounts
					const targetAcc = functions.findAccount(accData, accName); // search for the one with "accName"

					if (targetAcc){
						res.render("folder", {folder: folder, editAcc: targetAcc, accData: accData});
					} else {
						res.redirect('/folders/' + folderId + "/");
					}
				} else if (err){
					console.log(err);
					res.redirect('/folders/' + folderId + "/");
				}
			});
		} else if (err){
			console.log(err);
			res.redirect('/');
		}
	});
});

app.post('/folders/:id/:name/edit-account', (req, res) => {
	const folderId = req.params.id;
	const accName = req.params.name;
	let _userlogin = req.body.userlogin;
	let _password = req.body.password;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			const encKey = encryption.unobscureKey(user.secureArr);

			_userlogin = encryption.encryptText(encKey, _userlogin); // encrypt the new account info that user input
			_password = encryption.encryptText(encKey, _password);

			Folder.findOne({_id: folderId}, function(err, folder){
				if (folder){

					// update the account and redirect to folder account view 
					functions.updateAccount(accName, _userlogin, _password, folder, folderId, () => {
						res.redirect('/folders/' + folderId + "/");
					});

				} else {
					if (err) console.log(err);
					res.redirect('/folders/' + folderId + "/");
				} 
			});
		} else {
			if (err) console.log(err);
			res.redirect('/');
		}
	});
});

app.get('/folders/:id/:name/remove', (req, res) => {
	const folderId = req.params.id;
	const accName = req.params.name;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			const encKey = encryption.unobscureKey(user.secureArr);

			Folder.findOne({_id: folderId}, function(err, folder){
				if (folder){

					const accData = functions.getAccounts(folder, encKey); // get list of accounts
					const targetAcc = functions.findAccount(accData, accName); // search for the one with "accName"

					if (targetAcc){
						res.render("folder", {folder: folder, removeAcc: targetAcc, accData: accData});
					} else {
						res.redirect('/folders/' + folderId + "/");
					}

				} 
				else {
					if (err) console.log(err);
					res.redirect('/folders/' + folderId + "/");
				}
			});
		} else {
			res.redirect('/');
		}
	});
});

// now we want to process the deletion of an account
// we have to delete the account from DB
// and also remove the reference in the associated folder's accounts[] array
app.post('/folders/:id/:name/remove-account', (req, res) => {
	const folderId = req.params.id;
	const accName = req.params.name;

	Folder.findOne({_id: folderId}, function(err, folder){
		if (folder){
			functions.deleteAccount(accName, folder, folderId, () => {
				res.redirect('/folders/' + folderId + "/");
			});
		} else { 
			if (err) console.log(err);
			res.redirect('/folders/' + folderId + "/");
		} 
	});
});

app.set('view engine', 'hbs');

app.listen(process.env.PORT || 8080);