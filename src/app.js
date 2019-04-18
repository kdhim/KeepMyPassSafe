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

app.get('/', (req, res) => {
	res.render('index', {});
});

app.post('/', (req, res) => {
	const key = sanitize(req.body.key);

	User.findOne({key: key}, function(err, user){
		req.session.key = key; // set the session key

		if (!user) {
			console.log("User not found. Creating New USER " + key);
			new User({
				key: key,
				folders: []
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
			console.log('User ' + req.session.key + ' was found');
			const folders = user.folders;
			console.log('printing folders:');
			console.log(folders);
			res.render('dashboard', {folders: folders});
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
			console.log('entered this clause');
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
							});
						} else{
							console.log("unknown error creating the folder");
						}
					}
				});
				res.redirect('/dashboard'); // refresh the page
			}
		}
	});
});

app.get('/folders/:id', (req, res) => {
	const id = req.params.id;
	Folder.findOne({_id: id}, function(err, folder){
		if (folder){
			res.render("folder", {folder: folder});
		} else if (err){
			console.log(err);
			res.render("folder", {});
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
	const userlogin = req.body.userlogin;
	const password = req.body.password;
	const folderId = req.params.id;


});

app.set('view engine', 'hbs');

app.listen(process.env.port || 3000);

// code for encrypting and decrypting

/*

function encryptText(cipher_alg, key, iv, text, encoding) {

        const cipher = crypto.createCipheriv(cipher_alg, key, iv);

        encoding = encoding || "binary";

        let result = cipher.update(text, "utf8", encoding);
        result += cipher.final(encoding);

        return result;
    }

    function decryptText(cipher_alg, key, iv, text, encoding) {

        const decipher = crypto.createDecipheriv(cipher_alg, key, iv);

        encoding = encoding || "binary";

        let result = decipher.update(text, encoding);
        result += decipher.final();

        return result;
    }

    // ENCRYPTION ALGORITHMS: 
          "AES_128": "aes128",          //requires 16 byte key
          "AES_128_CBC": "aes-128-cbc", //requires 16 byte key
          "AES_192": "aes192",          //requires 24 byte key
          "AES_256": "aes256"           //requires 32 byte key

*/