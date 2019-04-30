KeepMyPassSafe

# Kevin Dhimitri

## Overview

KeepMyPassSafe is a password storage utility that automatically encrypts all of your sensitive account information. 

To begin, navigate to the homepage and enter a private key that will give you access to your accounts.

It is highly recommended that you write down the private key somewhere secure, or at least create a key that is easy for you to remember. Each time you enter your private key successfully, the app will automatically redirect your browser to a randomly generated URL which is only available in your current session. This mitigates attacks by eavesdroppers or by looking at browser history.

Once you are on your access page, you can then create a new Folder, which is a group of similar accounts. For example, all of your online shopping accounts (Amazon, Ebay, Etsy, etc) can go into one Folder. Within the Folder, you can add new accounts and view existing accounts.


## Data Model

The application will store Users, Folders, and Accounts.

* a user has a unique private key. each user will have multiple folders.
* each folder will have multiple accounts.
* each account will have a user-friendly name and the login information.

An Example User:

```javascript
{
  key: "BillYBob123",
  folders: []
}
```

An Example Folder:

```javascript
{
  name: "Email",
  accounts: []
}
```

An example Account:
```javascript
{
  name: "Gmail",
  userlogin: "bbob123@gmail.com",
  password: "ABCD123PASSWORD!@#"
}
```

## [Link to Commented First Draft Schema](db.js) 

https://github.com/nyu-csci-ua-0480-008-spring-2019/wonopon-final-project/blob/5857d6cb1592489591356ce64099270624236807/src/db.js#L4

## Site map

Home page -> Dashboard -> View Folder -> View Account -> Edit Account / Remove Account

On home page, you can login to your dashboard using your private key. 
On the dashboard, you can view all of your folders or groups of accounts. You can also create new folders.
You can click on a folder to view all of the accounts within it. Click on any account to go to the account page.
On the view account page, you can view, edit, or remove your private account information.

## User Stories or Use Cases

1. as a first time user, I can create a new user by specifying a private key.
2. as a user, I can create a folder (account group) to contain multiple accounts within a single category.
3. as a user, I can view existing folders and access the accounts I have created within them.
4. as a user, I can create new accounts by specifying a name (i.e Gmail), the username or login email (Bob@gmail.com) and the password.
5. as a user, I can edit account information or delete accounts from any folder.

## Research Topics

* (2 points) Use a CSS framework throughout your site, use a reasonable of customization of the framework (don't just use stock Bootstrap - minimally configure a theme)
    * I'm going to use Bootstrap for the design and layout of my website
* (6 points) Use a server-side JavaScript library or module that we did not cover in class (not including any from other requirements)
    * I'm going to use the Crypto Node.js API to encrypt user login information in database storage
    * Link to the API: https://nodejs.org/api/crypto.html#crypto_crypto
    * This is challenging because I will have to encrypt multiple account data as it is created, as well as decrypt it for viewing and editing.
    * I will use the Cipher and Decipher functionalities in the API.

8 points total out of 8 required points 

## [Link to Initial Main Project File](app.js) 

https://github.com/nyu-csci-ua-0480-008-spring-2019/wonopon-final-project/blob/70a43ee18dac248f842828d7fb3cc97ee2440bb7/src/app.js#L4


## Annotations / References Used

1. [Crypto NodeJS API](https://nodejs.org/api/crypto.html) - (https://github.com/nyu-csci-ua-0480-008-spring-2019/wonopon-final-project/blob/2bdcc115efcbc4d6356f93c9a489e3a3ed26ca1f/src/encryption.js#L9)
