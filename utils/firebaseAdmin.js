/* eslint-env node */
const admin = require("firebase-admin");
const production = require("./serviceAccount-production-key.json");
const testing = require("./serviceAccount-testing-key.json");

const keys = {
  production,
  testing
};

const baseUrls = {
  production: 'resorts-tapped-admin',
  testing: 'rta-testing',
};



// module.exports = admin;
module.exports = function (environment) {
  admin.initializeApp({
    credential: admin.credential.cert(keys[environment]),
    databaseURL: `https://${baseUrls[environment]}.firebaseio.com`,
    storageBucket: `${baseUrls[environment]}.appspot.com`
  });
  return admin;
};