/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
const db = admin.firestore();
const generateThumbnail = require('./generateThumbnail');

exports.httpEndpoint = functions.https.onRequest((request, response) => {
  const resortId = request.query.r;
  const docRef = db.doc('resorts/' + resortId);
  docRef.get().then(function(doc) {
    let responseString = JSON.stringify(doc.data())
    response.send(responseString);
  }).catch(function(error) {
    response.send(error);
  });
});

exports.generateThumbnail = generateThumbnail;