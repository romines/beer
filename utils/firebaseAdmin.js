/* eslint-env node */
const admin = require("firebase-admin");
const production = require("./serviceAccount-production-key.json");
const testing = require("./serviceAccount-testing-key.json");
const env = process.env.NODE_ENV;

const keys = {
  production,
  testing
};

const baseUrls = {
  production: 'resorts-tapped-admin',
  testing: 'rta-testing',
};

admin.initializeApp({
  credential: admin.credential.cert(keys[env]),
  databaseURL: `https://${baseUrls[env]}.firebaseio.com`,
  storageBucket: `${baseUrls[env]}.appspot.com`
});

module.exports = admin;