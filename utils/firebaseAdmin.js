/* eslint-env node */
const admin = require('firebase-admin');
const production = require('./serviceAccount-production-key.json');
const staging = require('./serviceAccount-staging-key.json');
const testing = require('./serviceAccount-testing-key.json');

const keys = {
  production,
  staging,
  testing,
};

const baseUrls = {
  production: 'resorts-tapped-admin',
  staging: 'rta-staging',
  testing: 'rta-testing',
};

module.exports.environments = { ...baseUrls };
module.exports.getConfig = environment => ({
  credential: admin.credential.cert(keys[environment]),
  databaseURL: `https://${baseUrls[environment]}.firebaseio.com`,
  storageBucket: `${baseUrls[environment]}.appspot.com`,
});

module.exports.initialize = function(environment, name) {
  const config = {
    credential: admin.credential.cert(keys[environment]),
    databaseURL: `https://${baseUrls[environment]}.firebaseio.com`,
    storageBucket: `${baseUrls[environment]}.appspot.com`,
  };

  admin.initializeApp(config);
  return admin;
};
