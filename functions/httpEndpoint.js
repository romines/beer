/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
// const db = admin.firestore();
const db = admin.database();

module.exports = functions.https.onRequest((request, response) => {
  const resortId = request.query.r;
  const STRIP_EMPTY = !!(request.query.strip && request.query.strip === '1');
  
  function stripIdsAndEmptyFields(group) {
    
    const rmUuid = (contact) => {
      if (contact.id !== undefined) delete contact.id;
      return contact;
    };

    const rmDescriptionEditor = (contact) => {
      if (contact.descriptionEditor !== undefined) delete contact.descriptionEditor;
      return contact;
    };

    const fixCoordinates = (contact) => {
      if (contact.rect === '{{0,0},{80,80}}' || contact.rect === '{{0,0}{80,80}}') delete contact.rect;
      return contact;
    };

    const stripEmptyFields = (contact) => {
        if (STRIP_EMPTY) {
          Object.keys(contact).forEach(key => {
            if ((contact[key]) !== 0 && !contact[key]) {
            delete contact[key];
          }
        });
      }
      return contact;
    };

    const cleanEmergencyContact = (emergencyContact) => {
      if (emergencyContact.tags && (emergencyContact.tags.dining !== undefined)) delete emergencyContact.tags.dining;
      if (emergencyContact.mapId !== undefined) delete emergencyContact.mapId;
      if (emergencyContact.noSort !== undefined) delete emergencyContact.noSort;
      return emergencyContact;
    };

    if (group.id !== undefined) delete group.id;
    group.list = group.list
      .map(rmUuid)
      .map(rmDescriptionEditor)
      .map(fixCoordinates)
      .map(stripEmptyFields);

    if (group.emergency) {
      if (group.seasonal !== undefined) delete group.seasonal;
      group.list = group.list.map(cleanEmergencyContact);
    }

    return group;

  }


  db.ref(resortId).once('value')

    .then(snapshot => {
      const { archiveData, published } = snapshot.val();
      const version = request.query.v && archiveData[request.query] ? request.query.v : null;

      const emergencyGroup = stripIdsAndEmptyFields(archiveData[published].emergencyGroup);

      const archiveKey = version ? version : published;

      const contactGroups = archiveData[archiveKey].contactGroups
        ? archiveData[published].contactGroups
          .filter(group => group.list)
          .map(stripIdsAndEmptyFields)
        : [];

      response.send(JSON.stringify({ contactGroups, emergencyGroup }));

    })
    .catch(function(error) {
      response.send(error);
    });

});