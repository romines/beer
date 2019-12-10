const args = require('yargs').argv;
const environment = args.env ? args.env : 'staging';
const admin = require('../firebaseAdmin.js')(environment);
const fs = require('fs');
console.log(`Connected to firestore with environment: ${environment}`);
const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });
const moment = require('moment');

const translateMapId = id => {
  if (id === '1532556795502') return '1538756849686';
  if (id === '1532556804981') return '1538756862375';
  return false;
};
db.collection('resorts')
  .get()
  .then(snapshot => {
    // build object of existing data
    const resorts = snapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    const updates = {};
    updates['jackson_hole'] = { contactGroups: [] };
    resorts['jackson_hole'].contactGroups.forEach((group, i) => {
      group.list.forEach((contact, j) => {
        if (!contact.coordinates) return;
        if (Object.keys(contact.coordinates).filter(translateMapId).length) {
          Object.keys(contact.coordinates).forEach(key => {
            const newKey = translateMapId(key);
            if (!newKey) return;
            if (!updates['jackson_hole'].contactGroups[i])
              updates['jackson_hole'].contactGroups[i] = { list: [] };
            if (!updates['jackson_hole'].contactGroups[i].list[j])
              updates['jackson_hole'].contactGroups[i].list[j] = {
                coordinates: {},
              };
            updates['jackson_hole'].contactGroups[i].list[j].coordinates[
              newKey
            ] = contact.coordinates[key];
          });
        }
      });
    });

    // const batch = db.batch();
    // Object.keys(updates).forEach(resortId => {
    //   const ref = db.collection('resorts').doc(resortId);
    //   batch.update(ref, updates[resortId]);
    // });

    // return batch.commit();
    fs.writeFile(
      `../backups/migrationTest_${moment().format()}.json`,
      JSON.stringify({ resorts: { ...updates } }),
      function(err) {
        if (err) {
          return console.log(err);
        }
        console.log('The file was saved!');
      }
    );
    return Promise.resolve();
  })

  // .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
