const functions = require('firebase-functions');
const app = require('express')();
const FBAuth  = require('./util/fbAuth');
const { db } = require('./util/admin');

const { 
    getAllScreams, 
    postOneScream,
    getScream,
    postCommentScream,
    deleteScream,
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
app.delete('scream/:screamId', FBAuth, deleteScream);
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

// NOTIFICATION route
exports.createNotificationOnLike = functions
    .region('asia-northeast1')
    .firestore
    .document('likes/{id}')
    .onCreate((snapshot) => {
        db 
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return db  
                        .collection(`/notifications/${snapshot.id}`)
                        .select({
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().userHandle,
                            sender: snapshot.data().userHandle,
                            type: 'like',
                            read: false,
                            screamId: doc.id
                        });
                }
            })
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });

exports.deleteNotificationOnUnlike = functions
    .region('asia-northeast1')
    .firestore
    .document('likes/{id}')
    .onDelete((snapshot) => {
        db
        .doc(`/screams/${snapshot.data().screamId}`)
        .delete()
        .then(() => {
            return;
        })
        .catch((err) => {
            console.error(err);
            return;
        });
    })

exports.createNotificationsOnComment = functions
    .region('asia-northeast1')
    .firestore
    .document('comments/{id}')
    .onCreate((snapshot) => {
        db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return db.collection(`/notifications/${snapshot.id}`)
                    .select({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });










