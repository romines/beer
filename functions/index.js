const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require('./cloud-functions-service-account-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

exports.tappedSettings = functions.https.onRequest((request, response) => {
  const resortId = request.query.r;
  const docRef = db.doc('resorts/' + resortId);
  docRef.get().then(function(doc) {
    let responseString = JSON.stringify(doc.data())
    response.send(responseString);
  }).catch(function(error) {
    response.send(error);
  });
});