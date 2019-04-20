const mongoose = require('mongoose'); // db.js

// a User will be uniquely identified by a "key"
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
	_id: mongoose.Schema.Types.ObjectId,
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
mongoose.model('User', User);
mongoose.model('Folder', Folder);
mongoose.model('Account', Account);

//mongoose.connect('mongodb://kd1621:utQX6Lap@class-mongodb.cims.nyu.edu/kd1621');

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 console.log("configuration: " + conf["dbconf"]);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/final';
}
mongoose.connect(dbconf);