/* eslint-env node */
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccount-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://resorts-tapped-admin.firebaseio.com",
  storageBucket: 'resorts-tapped-admin.appspot.com'
});

module.exports = admin;