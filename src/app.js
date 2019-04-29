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
const encryption = require('./encryption');

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

// mongo schema models
const User = mongoose.model('User');
const Folder = mongoose.model('Folder');
const Account = mongoose.model('Account');

// code for express routes

app.get('/', (req, res) => {

	/*const encrypted = encryptText("aes-256-cbc", "d6F3Efeq", "helloworld", "hex");
	console.log(encrypted);

	const decrypted = decryptText("aes-256-cbc", "d6F3Efeq", encrypted, "hex");
	console.log(decrypted);*/

//	console.log(encryption.generateCryptoKey());
//	console.log(encryption.generateCryptoKey());

	const key = encryption.generateCryptoKey();
	const obscured = encryption.obscureKey(key);
	const unobscured = encryption.unobscureKey(obscured);

	console.log("key: " + key);
	console.log("obscured: " + obscured);
	console.log("unobscured: " + unobscured);

	res.render('index', {});
});

app.post('/', (req, res) => {
	const key = sanitize(req.body.key);

	User.findOne({key: key}, function(err, user){
		req.session.key = key; // set the session key

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
			//console.log('User ' + req.session.key + ' was found');
			const folders = user.folders;
			//console.log('printing folders:');
			//console.log(folders);
			res.render('dashboard', {folders: folders});
			//console.log('User secure arr ' + user.secureArr);
			//console.log('User secure key ' + encryption.unobscureKey(user.secureArr));
		} else {
			res.redirect('/');
		}
	});
});

app.post('/dashboard', (req, res) => {
	const fname = sanitize(req.body.folderName);

	// 1. check if the folder already exists (there is already a folder with the same fname)
	// 2. if it does not, then create it, and update the dashboard
	// 3. if it does, print out an error
	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			let found = false;
			//console.log('entered this clause');
			const folders = user.folders;
			for (let i = 0; i < folders.length; i++){
				if (folders[i].name === fname){
					console.log("folders[i]: " + folders[i] + "i: " + i);
					found = true;
				}
			}

			if (found){
				console.log('Folder ' + fname + ' already exists for User ' + req.session.key);
				res.render('dashboard', {folders: folders, error: 'That folder already exists. Try with a different name.'});
			} else {
				new Folder({
				_id: mongoose.Types.ObjectId(),
				name: fname,
				accounts: []
				}).save(function(err, folder){
					if (err){
						console.log(err);
					} else {
						if (folder){ 
							User.findOneAndUpdate({key: req.session.key}, {$push: {folders: folder}}, function(err) {
								if (err){
									console.log("had error updating book with new review");
								} 
								res.redirect('/dashboard'); // refresh the page
							});
						} else{
							console.log("unknown error creating the folder");
							res.redirect('/dashboard'); // refresh the page
						}
					}
				});
				//res.redirect('/dashboard'); // refresh the page
			}
		}
	});
});

app.get('/folders/:id', (req, res) => {
	const id = req.params.id;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			const encKey = encryption.unobscureKey(user.secureArr);
			//console.log("found encKey: " + encKey);

			Folder.findOne({_id: id}, function(err, folder){
				if (folder){

					let accData = [];

					const accounts = folder.accounts;
					accounts.forEach(function(acc){
						const userlogin = encryption.decryptText(encKey, acc.userlogin);
						const password = encryption.decryptText(encKey, acc.password);
						accData.push({name: acc.name, userlogin: userlogin, password: password});
					});

					res.render("folder", {folder: folder, accData: accData});
				} else if (err){
					console.log(err);
					res.render("folder", {});
				}
			});
		} else if (err){
			console.log(err);
			res.redirect('/');
		} else {
			res.redirect('/');
		}
	});
});

app.get('/logout', (req, res) => {
	req.session.key = null;
	res.redirect('/');
});

app.get('/folders/:id/add', (req, res) => {
	const id = req.params.id;
	Folder.findOne({_id: id}, function(err, folder){
		if (folder){
			/*
			// use this code in the actual add-account part (after form completion)
			User.findOne({"key": req.session.key}, function(err, user){
				if (user){
					const accs = folder.accounts;
					const found = accs.forEach(function(acc){
						if ()
					});
				} else { // error no user found
					app.redirect('/');
				}
			});*/

			res.render("folder", {folder: folder, showAddAcc: true});
		} else if (err){
			console.log(err);
			res.render("folder", {});
		}
	});
});

app.post('/folders/:id/add-account', (req, res) => {
	const accName = req.body.name;
	let userlogin = req.body.userlogin;
	let password = req.body.password;
	const folderId = req.params.id;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			const encKey = encryption.unobscureKey(user.secureArr);
			userlogin = encryption.encryptText(encKey, userlogin);
			password = encryption.encryptText(encKey, password);

			new Account({
	//		_id: mongoose.Types.ObjectId(),
			name: accName,
			userlogin: userlogin,
			password: password
			}).save(function(err, acc){
				if (err){
					console.log(err);
				} else {
					if (acc){ // might be error with pushing it to the accounts folder
						Folder.findOneAndUpdate({_id: folderId}, {$push: {accounts: acc}}, function(err) {
							if (err){
								console.log("had error updating folder with new account");
							} 
							res.redirect('/folders/' + folderId); // refresh the page
						});
					} else{
						console.log("unknown error creating the folder");
						res.redirect('/folders/' + folderId); // refresh the page
					}
				}
			});
		}
		else if (err){
			console.log(err);
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

					// determine if the account actually exists within this folder

					let accData = [];

					const accs = folder.accounts;
					let found = false;
					accs.forEach(function(acc){
						
						const userlogin = encryption.decryptText(encKey, acc.userlogin);
						const password = encryption.decryptText(encKey, acc.password);
						accData.push({name: acc.name, userlogin: userlogin, password: password});

						if (acc.name === accName){
							found = true;
							res.render("folder", {folder: folder, editAcc: acc, accData: accData});
						}
					});

					if (!found){
						res.redirect('/folders/' + folderId);
					}
				} else if (err){
					console.log(err);
					res.redirect('/folders/' + folderId);
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
			//console.log("my key: " + encKey);

			_userlogin = encryption.encryptText(encKey, _userlogin);
			_password = encryption.encryptText(encKey, _password);

			Folder.findOne({_id: folderId}, function(err, folder){
				if (folder){

					Account.findOneAndUpdate({name: accName}, {$set: {userlogin: _userlogin, password: _password}}, function(err, acc){
						if (acc){
							//console.log(acc);
							const accs = folder.accounts;
							// update the accounts array within the folder
							accs.forEach(function(el){
								if (el.name === accName){
									el.userlogin = _userlogin;
									el.password = _password;
								}
							});

							// save that new accounts array to the folder in db
							Folder.findOneAndUpdate({_id: folderId}, {$set: {accounts: accs}}, function(err, folder){
								if (folder){
									res.redirect('/folders/' + folderId);
								} else if (err) {
									console.log(err);
								}
							});
						}
						else if (err){
							console.log(err);
							res.redirect('/folders/' + folderId);
						}
					});

				} // end if(folder)
			});
		}
	});

	/*Folder.findOne({_id: folderId}, function(err, folder){
		if (folder){
			Account.findOneAndUpdate({name: accName}, {$set: {userlogin: _userlogin, password: _password}}, function(err, acc){
				if (acc){
					const accs = folder.accounts;
					// update the accounts array within the folder
					accs.forEach(function(el){
						if (el.name === accName){
							el.userlogin = _userlogin;
							el.password = _password;
						}
					});

					// save that new accounts array to the folder in db
					Folder.findOneAndUpdate({_id: folderId}, {$set: {accounts: accs}}, function(err, folder){
						if (folder){
							res.redirect('/folders/' + folderId);
						} else if (err) {
							console.log(err);
						}
					});
				}
				else if (err){
					console.log(err);
					res.redirect('/folders/' + folderId);
				}
			});
		} else if (err){
			console.log(err);
			res.redirect('/folders/' + folderId);
		}
	});*/
});

app.get('/folders/:id/:name/remove', (req, res) => {
	const folderId = req.params.id;
	const accName = req.params.name;

	User.findOne({"key": req.session.key}, function(err, user){
		if (user){
			const encKey = encryption.unobscureKey(user.secureArr);

			Folder.findOne({_id: folderId}, function(err, folder){
				if (folder){

					let accData = [];
					// determine if the account actually exists within this folder
					const accs = folder.accounts;
					let found = false;
					accs.forEach(function(acc){
						const userlogin = encryption.decryptText(encKey, acc.userlogin);
						const password = encryption.decryptText(encKey, acc.password);
						accData.push({name: acc.name, userlogin: userlogin, password: password});

						if (acc.name === accName){
							found = true;
							res.render("folder", {folder: folder, removeAcc: acc, accData: accData});
						}
					});

					if (!found){
						res.redirect('/folders/' + folderId);
					}
				} else if (err){
					console.log(err);
					res.redirect('/folders/' + folderId);
				} else {
					res.redirect('/folders/' + folderId);
				}
			});
		}
	});
});

app.post('/folders/:id/:name/remove-account', (req, res) => {
	const folderId = req.params.id;
	const accName = req.params.name;

	Folder.findOne({_id: folderId}, function(err, folder){
		if (folder){
			Account.deleteOne({name: accName}, function(err, acc){
				if (acc){
					const accs = folder.accounts;

					// delete the account from within the folder.accounts array
					let idx = -1;
					for (let i = 0; i < accs.length; i++){
						const el = accs[i];
						if (el.name === accName){
							idx = i;
						}
					}

					if (idx != -1){
						accs.splice(idx, 1);
					}

					// update the folder array so that it doesn't have the deleted account
					Folder.findOneAndUpdate({_id: folderId}, {$set: {accounts: accs}}, function(err, folder){
						if (folder){
							res.redirect('/folders/' + folderId);
						} else if (err) {
							console.log(err);
						}
					});
				}
				else if (err){
					console.log(err);
					res.redirect('/folders/' + folderId);
				}
			});
		} else if (err){
			console.log(err);
			res.redirect('/folders/' + folderId);
		}
	});
});

app.set('view engine', 'hbs');

app.listen(process.env.PORT || 3000);

// code for encrypting and decrypting


/*
    // ENCRYPTION ALGORITHMS: 
          "AES_128": "aes128",          //requires 16 byte key
          "AES_128_CBC": "aes-128-cbc", //requires 16 byte key
          "AES_192": "aes192",          //requires 24 byte key
          "AES_256": "aes256"           //requires 32 byte key
*/
