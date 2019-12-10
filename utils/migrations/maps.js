const args = require('yargs').argv;
const environment = args.env ? args.env : 'staging';
const admin = require('./firebaseAdmin.js').initialize(environment);
// const fs = require('fs');
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
      if (!updates[resortId].mapFiles) {
        updates[resortId].mapFiles = [];
        return;
      }
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
          if (
            !updates[resortId].maps[contact.mapId] &&
            updates[resortId].maps[0]
          ) {
            console.log(`${resortId} - ${group.section} - ${contact.name}`);
            return {
              ...contact,
              coordinates: {
                [updates[resortId].maps[0].id]: contact.rect,
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

    return batch.commit();
    // fs.writeFile(
    //   './backups/migrationTest.json',
    //   JSON.stringify({ resorts: { ...updates } }),
    //   function(err) {
    //     if (err) {
    //       return console.log(err);
    //     }
    //     console.log('The file was saved!');
    //   }
    // );
    // return Promise.resolve();
  })

  .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
