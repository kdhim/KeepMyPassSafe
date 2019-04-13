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

(___TODO__: sample documents_)

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

(___TODO__: create a first draft of your Schemas in db.js and link to it_)

## Wireframes

(___TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc._)

/list/create - page for creating a new shopping list

![list create](documentation/list-create.png)

/list - page for showing all shopping lists

![list](documentation/list.png)

/list/slug - page for showing specific shopping list

![list](documentation/list-slug.png)

## Site map

Home page -> Dashboard -> View Folder -> View Account

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

(___TODO__: create a skeleton Express application with a package.json, app.js, views folder, etc. ... and link to your initial app.js_)

## Annotations / References Used

(___TODO__: list any tutorials/references/etc. that you've based your code off of_)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)
