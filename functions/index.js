/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
const db = admin.firestore();
const generateThumbnail = require('./generateThumbnail');

exports.httpEndpoint = functions.https.onRequest((request, response) => {
  const resortId = request.query.r;
  const docRef = db.doc('resorts/' + resortId);
  const rmUuid = (contact) => {
    if (contact.id !== undefined) delete contact.id;
    return contact
  }
  const stripContactIds = (group) => {
    group.list = group.list.map(rmUuid)
    return group
  }
  docRef.get().then(function(doc) {
    let resortData = doc.data()
    resortData.contactGroups = resortData.contactGroups.map(stripContactIds)
    let responseString = JSON.stringify(resortData)
    response.send(responseString);
  }).catch(function(error) {
    response.send(error);
  });
});

exports.generateThumbnail = generateThumbnail;