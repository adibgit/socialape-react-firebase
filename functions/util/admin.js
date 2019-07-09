//initialize admin
const admin = require('firebase-admin');
admin.initializeApp();

// initialize firebase
const config = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config);

// initialize firestore
const db = admin.firestore();
const auth = firebase.auth();

//exports
module.exports = { admin, db, auth, firebase };




