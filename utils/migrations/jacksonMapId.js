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

    const swapIdsForGroup = group => ({
      ...group,
      list: group.list.map(swapIdsForContact),
    });

    const swapIdsForContact = contact => {
      if (!contact.coordinates) return contact;
      const newCoordinates = {};
      if (contact.coordinates['1532556795502']) {
        newCoordinates['1538756849686'] = contact.coordinates['1532556795502'];
      }
      if (contact.coordinates['1532556804981']) {
        newCoordinates['1538756862375'] = contact.coordinates['1532556804981'];
      }
      return { ...contact, coordinates: { ...newCoordinates } };
    };

    const contactGroups = resorts['jackson_hole'].contactGroups.map(
      swapIdsForGroup
    );

    const batch = db.batch();
    const ref = db.collection('resorts').doc('jackson_hole');
    batch.update(ref, { contactGroups });

    return batch.commit();
  })

  .then(() => console.log('batch committed successfully . . . '))
  .catch(error => {
    console.log(error);
  });
