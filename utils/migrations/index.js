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
    // build object of existing data
    const resorts = snapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    // eslint-disable-next-line no-unused-vars
    const updates = {};

    // const batch = db.batch();
    // Object.keys(updates).forEach(resortId => {
    //   const ref = db.collection('resorts').doc(resortId);
    //   batch.update(ref, updates[resortId]);
    // });

    // return batch.commit();
    fs.writeFile(
      `../backups/migrationRollback_${moment().format()}.json`,
      JSON.stringify({ resorts: { ...resorts } }),
      function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          `backup saved to backups/migrationRollback_${moment().format()}.json`
        );
      }
    );
    return Promise.resolve();
  })

  // .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
