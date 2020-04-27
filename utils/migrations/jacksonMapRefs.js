const args = require('yargs').argv;
const environment = args.env ? args.env : 'staging';
const admin = require('../firebaseAdmin.js').initialize(environment);
console.log(`Connected to firestore with environment: ${environment}`);
const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

db.collection('resorts')
  .get()
  .then(snapshot => {
    // build object of existing data
    const resorts = snapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    const translateMapId = id => {
      if (id === '1532556795502') return '1538756849686';
      if (id === '1532556804981') return '1538756862375';
      return false;
    };

    const swapIdsMapObj = mapObj => ({
      ...mapObj,
      id: translateMapId(mapObj.id),
    });

    const maps = resorts['jackson_hole'].maps.map(swapIdsMapObj);

    const batch = db.batch();
    const ref = db.collection('resorts').doc('jackson_hole');
    batch.update(ref, { maps });

    return batch.commit();
  })

  .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
