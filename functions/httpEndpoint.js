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

  function stripIdsAndEmptyFields(group) {

    const rmUuid = (contact) => {
      if (contact.id !== undefined) delete contact.id;
      return contact
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

    const cleanEmergencyContact = (emergencyContact) => {
      if (emergencyContact.tags && (emergencyContact.tags.dining !== undefined)) delete emergencyContact.tags.dining
      if (emergencyContact.mapId !== undefined) delete emergencyContact.mapId
      if (emergencyContact.noSort !== undefined) delete emergencyContact.noSort
      return emergencyContact
    };

    if (group.id !== undefined) delete group.id;
    group.list = group.list
      .map(rmUuid)
      .map(stripEmptyFields);

    if (group.emergency) {
      group.list = group.list.map(cleanEmergencyContact);
    }

    return group;

  }



  db.ref(resortId).once('value', snapshot => {

    const resortData = snapshot.val();
    const emergencyGroup = stripIdsAndEmptyFields(resortData.archiveData[resortData.published].emergencyGroup)
    let contactGroups = resortData.archiveData[resortData.published].contactGroups
      .map(stripIdsAndEmptyFields);
    contactGroups.push(emergencyGroup);

    const responseObject = {
      name: resortData.name,
      mapFiles: resortData.mapFiles,
      resortId: resortData.resortId,
      keys: resortData.keys,
      contactGroups,
      emergencyGroup
    }

    const responseString = JSON.stringify(responseObject)
    console.log(`${_deleteCount} fields deleted . . .`);

    response.send(responseString);

  }).catch(function(error) {
    response.send(error);
  });

});