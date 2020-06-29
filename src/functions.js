/*
* this file (functions.js) holds a lot of utility functions for our program
* to handle tasks such as account deletion, folder search, etc.
*/ 

const mongoose = require('mongoose');
const encryption = require('./encryption');
require('./db');

// get our mongoose models for proper DB engagement
const User = mongoose.model('User');
const Folder = mongoose.model('Folder');
const Account = mongoose.model('Account');

/* saves a newly created folder into the corresponding User's folders array
* @PARAMS
*   - userKey: the key uniquely identifying the user (usually req.session.key)
*   - folder: the newly created folder returned by save()
*   - err: error information
*   - cb: callback function upon function completion
*/
function saveFolder(userKey, folder, err, cb){
    if (err){
        console.log(err);
    } else {
        if (folder){ 
            // add the folder to the User folders array
            User.findOneAndUpdate({key: userKey}, {$push: {folders: folder}}, function(err) {
                if (err){
                    console.log("could not register new folder under user's folder storage");
                } 
                cb();
            });
        } else{
            console.log("unknown error creating the folder");
            cb();
        }
    }
}

/* given a user and folder name, return TRUE if the folder exists for user, returns FALSE otherwise
* @PARAMS
*   - user: the user object
*   - fname: string containing name of folder
*   - err: error information 
*/
function findFolder(user, fname){
    let found = false;

    const folders = user.folders;
    for (let i = 0; i < folders.length; i++){
        if (folders[i].name === fname){
            console.log("folders[i]: " + folders[i] + "i: " + i);
            found = true;
        }
    }

    return found;
}

/* returns an Array containing the decrypted accounts stored in a folder 
* @PARAMS
*   - folder: the folder object containing the account information
*   - encKey: the cipher key required to decrypt our encrypted account data
*/
function getAccounts(folder, encKey){
    let accData = [];

    const accounts = folder.accounts;
    accounts.forEach(function(acc){
        const userlogin = encryption.decryptText(encKey, acc.userlogin);
        const password = encryption.decryptText(encKey, acc.password);
        accData.push({name: acc.name, userlogin: userlogin, password: password});
    });

    return accData;
}

/* returns the account matching "accName" OR NULL otherwise
* @PARAMS
*   - accounts: the folder array of accounts 
*   - accName: requested account name
*/
function findAccount(accounts, accName){

    for (let i = 0; i < accounts.length; i++){
        const acc = accounts[i];
        if (acc.name == accName){
            return acc;
        }
    }
    
    return null;
}

/* saves a newly created Account in the appropriate Folder object's accounts array 
* @PARAMS
*   - acc: the created account object 
*   - folderId: the id of the folder associated with the account
*   - err: error information
*   - cb: callback function upon completion
*/
function saveAccount(acc, folderId, err, cb){
    if (err){
        console.log(err);
    } else {
        if (acc){ // might be error with pushing it to the accounts folder
            Folder.findOneAndUpdate({_id: folderId}, {$push: {accounts: acc}}, function(err2) {
                if (err2){
                    console.log("had error updating folder with new account");
                } 
                cb(); 
            });
        } else{
            console.log("unknown error creating the folder");
            cb();
        }
    }
}

/* update the account matching "accName" with new user login and password
* @PARAMS
*   - accName: requested account name string 
*   - _userlogin: new user login string encrypted
*   - _password: new password string encrypted
*   - folder: folder object
*   - folderId: id of folder
*   - cb: callback function upon completion or err
*/
function updateAccount(accName, _userlogin, _password, folder, folderId, cb){
    Account.findOneAndUpdate({name: accName}, {$set: {userlogin: _userlogin, password: _password}}, function(err, acc){
        if (acc){
            const accs = folder.accounts;
            // update the accounts array within the folder
            accs.filter(function(el){
                if (el.name === accName){
                    el.userlogin = _userlogin;
                    el.password = _password;
                }
            });

            // save that new accounts array to the folder in db
            Folder.findOneAndUpdate({_id: folderId}, {$set: {accounts: accs}}, function(err, folder){
                if (folder){
                    cb();
                } else {
                    if (err) {
                        console.log(err);
                    }
                    cb();
                }
            });
        }
        else {
            if (err) {
                console.log(err);
            }
            cb();
        }
    });
}

/* update the account matching "accName" with new user login and password
* @PARAMS
*   - accName: requested account name string 
*   - _userlogin: new user login string encrypted
*   - _password: new password string encrypted
*   - folder: folder object
*   - folderId: id of folder
*   - cb: callback function upon completion or err
*/
function deleteAccount(accName, folder, folderId, cb){
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
                    cb();
                } else {
                    if (err){
                        console.log(err);
                    }
                    cb();
                } 
            });
        }
        else {
            if (err){
                console.log(err);
            }
            cb();
        } 
    });
}


module.exports = {
    findFolder: findFolder,
    saveFolder: saveFolder,
    getAccounts: getAccounts,
    saveAccount: saveAccount,
    findAccount: findAccount,
    updateAccount: updateAccount,
    deleteAccount: deleteAccount
};