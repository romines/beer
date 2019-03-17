const args = require('yargs').argv;
const environment = args.env ? args.env : 'staging';
const admin = require('./firebaseAdmin.js')(environment);
console.log(`Connected to firestore with environment: ${environment}`);
const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });
const moment = require('moment');

db.collection('resorts')
  .get()
  .then(snapshot => {
    // build updates dictionary
    const updates = snapshot.docs.reduce((acc, doc) => {
      const { mapFiles, contactGroups } = doc.data();
      acc[doc.id] = { mapFiles, contactGroups };
      return acc;
    }, {});

    // add metadata to maps
    Object.keys(updates).forEach(resortId => {
      updates[resortId].maps = updates[resortId].mapFiles.map(url => {
        const id = url
          .split('map')
          [url.split('map').length - 1].split('.png')[0]
          .slice(1);
        return {
          name: `Map file - ${moment(parseInt(id)).format('MMMM Do, YYYY')}`,
          url,
          id,
          active: true,
        };
      });
      updates[resortId].contactGroups = updates[resortId].contactGroups.map(
        addCoordinatesToGroup
      );
      function addCoordinatesToGroup(group) {
        const addCoordinatesToContact = contact => {
          if (contact.mapId < 0) return contact;
          if (!updates[resortId].maps[contact.mapId]) {
            // console.log(`${resortId} - ${group.section} - ${contact.name}`);
            return {
              ...contact,
              coordinates: {
                ['missing_map']: contact.rect,
              },
            };
          }
          return {
            ...contact,
            coordinates: {
              [updates[resortId].maps[contact.mapId].id]: contact.rect,
            },
          };
        };
        return {
          ...group,
          list: group.list.map(addCoordinatesToContact),
        };
      }
    });

    const batch = db.batch();
    Object.keys(updates).forEach(resortId => {
      const ref = db.collection('resorts').doc(resortId);
      batch.update(ref, updates[resortId]);
    });

    // return batch.commit();
  })

  .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
