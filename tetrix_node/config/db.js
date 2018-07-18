var firebase = require("firebase");
var serviceAccount = require('./secrets/serviceAccountKey.json');
var admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tetrix-1d1fc.firebaseio.com/'
})
module.exports = admin