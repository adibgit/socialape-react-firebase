const functions = require('firebase-functions');
const app = require('express')();
const FBAuth  = require('./util/fbAuth');

const { 
    getAllScreams, 
    postOneScream,
    getScream,
    postCommentScream,
    getLikeScream,
    getUnlikeScream } = require('./handlers/screams');
const { 
    postSignup, 
    postLogin, 
    postUploadImage, 
    postAddUserDetails,
    getAuthenticatedUser } = require('./handlers/users');

// Routes
// screams
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
// TODO: delete scream
app.get('/scream/:screamId/like', FBAuth, getLikeScream);
app.get('/scream/:screamId/unlike', FBAuth, getUnlikeScream);
app.post('/scream/:screamId/comment', FBAuth, postCommentScream);

// users
app.post('/signup', postSignup); 
app.post('/login', postLogin);
app.post('/user/image', FBAuth, postUploadImage);
app.post('/user', FBAuth, postAddUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser);

// ROUTE
// API route
exports.api = functions.region('asia-northeast1').https.onRequest((app));








