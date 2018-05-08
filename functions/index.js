/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
const db = admin.firestore();
const generateThumbnail = require('./generateThumbnail');

exports.httpEndpoint = functions.https.onRequest((request, response) => {
  const resortId = request.query.r;
  const STRIP_EMPTY = !!(request.query.strip && request.query.strip === '1');
  console.log(`STRIP_EMPTY: ${STRIP_EMPTY}`);
  const docRef = db.doc('resorts/' + resortId);
  let _deleteCount = 0;

  const rmUuid = (contact) => {
    if (contact.id !== undefined) delete contact.id;
    return contact
  }
  const stripContactIdsAndEmptyFields = (group) => {
    group.list = group.list
      .map(rmUuid)
      .map(stripEmptyFields)
    return group
  }
  const stripEmptyFields = (contact) => {
    if (STRIP_EMPTY) {
      Object.keys(contact).forEach(key => {
        if ((contact[key]) !== 0 && !contact[key]) {
          delete contact[key]
          _deleteCount += 1
        }
      });
    }
    console.log(`${_deleteCount} fields deleted . . .`);
    return contact
  }

  docRef.get().then(function(doc) {
    let resortData = doc.data()
    resortData.contactGroups = resortData.contactGroups.map(stripContactIdsAndEmptyFields)
    let responseString = JSON.stringify(resortData)
    response.send(responseString);
  }).catch(function(error) {
    response.send(error);
  });

});

exports.generateThumbnail = generateThumbnail;