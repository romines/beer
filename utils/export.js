const admin = require('./firebaseAdmin.js')('production');
const moment = require('moment');
const fs = require('fs');

const collectionName = process.argv[2] ? process.argv[2] : 'resorts';
const fileName = process.argv[3]
  ? process.argv[3]
  : `./backups/${moment().format('MMDD')}.json`;

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

const data = {};
data[collectionName] = {};

console.log(
  `NOTE: exporting from ${
    process.env.NODE_ENV ? process.env.NODE_ENV : 'production'
  } . . .`
);

var results = db
  .collection(collectionName)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      data[collectionName][doc.id] = doc.data();
    });
    return data;
  })
  .catch(error => {
    console.log(error);
  });

results.then(data => {
  // Write collection to JSON file
  fs.writeFile(fileName, JSON.stringify(data), function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
});
