const args = require('yargs').argv;
const environment = args.env ? args.env : 'staging';
const admin = require('../firebaseAdmin.js')(environment);
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
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    // add metadata to maps
    Object.keys(updates).forEach(resortId => {
      // do something here
    });

    const batch = db.batch();
    Object.keys(updates).forEach(resortId => {
      const ref = db.collection('resorts').doc(resortId);
      batch.update(ref, updates[resortId]);
    });

    // return batch.commit();
    fs.writeFile(
      './backups/migrationTest.json',
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

  .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
