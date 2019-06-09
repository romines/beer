/* eslint-env node */
const config = JSON.parse(process.env.FIREBASE_CONFIG);
const staging = require('./serviceAccount-staging-key.json');
const production = require('./serviceAccount-production-key.json');
const admin = require('firebase-admin');

admin.initializeApp({
  ...config,
  credential: admin.credential.cert(
    config.projectId === 'resorts-tapped-admin' ? production : staging
  ),
});

module.exports = admin;
