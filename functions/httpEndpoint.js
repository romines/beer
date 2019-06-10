/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
const db = admin.database();

module.exports = functions.https.onRequest((request, response) => {
  const resortId = request.query.r;
  const STRIP_EMPTY = !!(request.query.strip && request.query.strip === '1');

  function stripIdsAndEmptyFields(group) {
    const rmUuid = contact => {
      if (contact.id !== undefined) delete contact.id;
      return contact;
    };

    const rmDescriptionEditor = contact => {
      if (contact.descriptionEditor !== undefined)
        delete contact.descriptionEditor;
      return contact;
    };

    const fixCoordinates = contact => {
      if (
        contact.rect === '{{0,0},{80,80}}' ||
        contact.rect === '{{0,0}{80,80}}'
      )
        delete contact.rect;
      return contact;
    };

    const stripEmptyFields = contact => {
      if (STRIP_EMPTY) {
        Object.keys(contact).forEach(key => {
          if (contact[key] !== 0 && !contact[key]) {
            delete contact[key];
          }
        });
      }
      return contact;
    };

    const cleanEmergencyContact = emergencyContact => {
      if (emergencyContact.tags && emergencyContact.tags.dining !== undefined)
        delete emergencyContact.tags.dining;
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

  db.ref(resortId)
    .once('value')

    .then(snapshot => {
      const { archiveData, archiveList, published } = snapshot.val();

      const version = request.query.v ? request.query.v : published;
      const emergencyGroup = stripIdsAndEmptyFields(
        archiveData[version].emergencyGroup
      );

      const contactGroups = archiveData[version].contactGroups
        ? archiveData[version].contactGroups
            .filter(group => group.list)
            .map(stripIdsAndEmptyFields)
        : [];

      const versionMeta = archiveList[version];

      const payload = {
        version: {
          published: version === published,
          name: versionMeta.name,
          dateSaved: versionMeta.date,
        },
        contactGroups,
        emergencyGroup,
      };

      response.send(JSON.stringify(payload));
    })
    .catch(function(error) {
      response.send(error);
    });
});
