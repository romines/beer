/* eslint-env node */
const admin = require('firebase-admin');

const serviceAccounts = {
  'resorts-tapped-admin': require('./cloud-functions-service-account-key.json'),
  'rta-staging': require('./cloud-functions-service-account-staging-key.json')
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccounts[process.env.GCLOUD_PROJECT])
});

module.exports = admin;

