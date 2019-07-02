const functions = require('firebase-functions');

// initialize firebase admin
const admin = require('firebase-admin');
admin.initializeApp();

// initialize express
const express = require('express');
const app = express();

// initialize firebase
const config = {
    apiKey: "AIzaSyArsgghzpGtxwoATFhAvr7SWW6s15lKYEw",
    authDomain: "socialape-f2231.firebaseapp.com",
    databaseURL: "https://socialape-f2231.firebaseio.com",
    projectId: "socialape-f2231",
    storageBucket: "socialape-f2231.appspot.com",
    messagingSenderId: "237848913114",
    appId: "1:237848913114:web:7ab1a8bb155ef454"
};
const firebase = require('firebase');
firebase.initializeApp(config);

// initialize firestore
const db = admin.firestore();
const auth = firebase.auth();

//initialize email regex
const emailRegex = require('email-regex');

// API
// express method api functions
// GET - get screams
app.get('/screams', (req, res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let screams = [];
            data.forEach((doc) => {
                // screams.push(doc.data());
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            })
            return res.json(screams);
        })
        .catch((err) => console.error(err))
})

// POST - create scream
app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
        .collection('screams')
        .add(newScream)
        .then((doc) => {
            res.json({
                message: 'document ${doc.id} successfully created'
            });
        })
        .catch((err) => {
            res.status((500).json({
                error: 'Something went wrong'
            }));
            console.error(err);
        });
})

// POST - signup
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };
    
    let errors = {};

    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Email must be a valid email address'
    }

    if (isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if (newUser.confirmPassword !== newUser.confirmPassword) errors.confirmPassword = 'Password not matched'
    if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty'
    if (Object.keys(errors).length > 0) return res.status(400).json(errors)

    let token, userId;
    db
        .doc('/users/${newUser.handle}')
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(400).json({
                    handle: 'this handle is already taken'
                });
            } else {
                return auth.createUserWithEmailAndPassword(newUser.email, newUser.password)         
            }
        })  
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((tokenRes) => {
            token = tokenRes;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                create: new Date().toISOString(),
                userId
            };

            return db
                .doc('/users/${newUser.handle}')
                .set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({
                token
            })
        })
        .catch((err) => {
            console.error(err);

            if (err.code == 'auth/email-already-in-use') {
                return res.status(400).json({
                    email: 'Email is already in use'
                });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
})

// ROUTE
// API route
exports.api = functions.region('asia-northeast1').https.onRequest((app));

//HELPER
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    if (emailRegex().test(email)) return true;
    else return false;
}


