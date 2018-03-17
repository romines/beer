/* eslint-env node */
const admin = require('firebase-admin');
const serviceAccount = require('./cloud-functions-service-account-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

