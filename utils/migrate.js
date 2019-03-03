const args = require('yargs').argv;
const environment = args.env ? args.env : 'staging';
const admin = require('./firebaseAdmin.js')(environment);
console.log(`Connected to firestore with environment: ${environment}`);
const db = admin.firestore();
const moment = require('moment');

db.collection('resorts')
  .get()
  .then(snapshot =>
    snapshot.docs.reduce((acc, doc) => {
      const { mapFiles } = doc.data();
      acc[doc.id] = mapFiles.map(url => {
        const timestamp = url
          .split('map')
          [url.split('map').length - 1].split('.png')[0]
          .slice(1);
        return {
          name: `Map file - ${moment(parseInt(timestamp)).format(
            'MMMM Do, YYYY h:mm A'
          )}`,
          url,
          timestamp,
          active: true,
        };
      });
      return acc;
    }, {})
  )
  .then(mapUpdates => {
    const batch = db.batch();
    Object.keys(mapUpdates).forEach(resortId => {
      const ref = db.collection('resorts').doc(resortId);
      batch.update(ref, { maps: [...mapUpdates[resortId]] });
    });
    return batch.commit();
  })
  .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
