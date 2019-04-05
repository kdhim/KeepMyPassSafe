const mongoose = require('mongoose'); // db.js

const User = new mongoose.Schema({
	key: {
		type: String,
		required: true
	},
	folders: {
		type: Array,
		default: []
	}
});

// a folder will be a group for similar accounts
// i.e a user can create a group for Email accounts
// this group will contain all the account information in its "accounts" field
const Folder = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	accounts: {
		type: Array,
		default: []
	}
});

// name: only for user purposes and UI only (ex: Gmail)
// userlogin: either the username or email address required to login (ex: whatever@gmail.com)
// password: the password for the account (ex: blahblah123)
const Account = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	userlogin: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

// "register" them so that mongoose knows about them
mongoose.model('Folder', Folder);
mongoose.model('Account', Account);

mongoose.connect('mongodb://localhost/final');