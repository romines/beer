/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
// const db = admin.firestore();
const db = admin.database();

module.exports = functions.https.onRequest((request, response) => {
  const resortId = request.query.r;
  const STRIP_EMPTY = !!(request.query.strip && request.query.strip === '1');
  console.log(`STRIP_EMPTY: ${STRIP_EMPTY}`);
  // const docRef = db.doc('resorts/' + resortId);
  // const resortRoot = db.ref(resortId);
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
          delete contact[key];
          _deleteCount += 1;
        }
      });
    }
    return contact
  }

  db.ref(resortId).once('value', snapshot => {

    const resortData = snapshot.val();
    const responseObject = {
      name: resortData.name,
      mapFiles: resortData.mapFiles,
      resortId: resortData.resortId,
      keys: resortData.keys,
      contactGroups: resortData.archiveData[resortData.published].map(stripContactIdsAndEmptyFields)
    }

    const responseString = JSON.stringify(responseObject)
    console.log(`${_deleteCount} fields deleted . . .`);

    response.send(responseString);

  }).catch(function(error) {
    response.send(error);
  });

  // docRef.get().then(function(doc) {
  //   let resortData = doc.data()
  //   resortData.contactGroups = resortData.contactGroups.map(stripContactIdsAndEmptyFields)
  //   let responseString = JSON.stringify(resortData)
  //   response.send(responseString);
  // }).catch(function(error) {
  //   response.send(error);
  // });

});