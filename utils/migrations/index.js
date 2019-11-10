const args = require('yargs').argv;
const environment = args.env ? args.env : 'staging';
const admin = require('../firebaseAdmin.js')(environment);
const fs = require('fs');
console.log(`Connected to firestore with environment: ${environment}`);
const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });
const moment = require('moment');

db.collection('resorts')
  .get()
  .then(snapshot => {
    // build updates dictionary
    const resorts = snapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    // Object.keys(updates).forEach(resortId => {
    //   // do something here
    // });
    const updates = { test_resort: {} };
    updates['test_resort'].maps = resorts['test_resort'].mapFiles.map(url => {
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

    const batch = db.batch();
    Object.keys(updates).forEach(resortId => {
      const ref = db.collection('resorts').doc(resortId);
      batch.update(ref, updates[resortId]);
    });

    // return batch.commit();
    fs.writeFile(
      '../backups/migrationTest.json',
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
