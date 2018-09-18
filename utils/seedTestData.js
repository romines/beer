const admin = require('./firebaseAdmin.js')('testing');
const moment = require('moment');
const firestoreDocs = admin.firestore();
const rtdb = admin.database();

// supress dates
firestoreDocs.settings({timestampsInSnapshots: true});

const testResortDocRef = firestoreDocs.collection('resorts').doc('test_resort');
const testResortRtdbRef = rtdb.ref('test_resort');
const writeOperations = [];
const emergencyGroup = {
  list: [
    {
      email: '',
      imageUrl: '',
      mailto: '',
      menu: '',
      name: 'Emergency Group',
      number: '+1-307-555-1212',
      rect: '',
      sms: '',
      tags: { summer: true, winter: true },
      url: '',
      z_detail: '',
      z_reservations: ''
    }
  ],
  seasonal: false,
  section: 'Emergency'
};

writeOperations.push(testResortDocRef.set({
  contactGroups: [],
  country: 'US',
  mapFiles: ['https://firebasestorage.googleapis.com/v0/b/resorts-tapped-admin.appspot.com/o/jackson_hole%2Fmap_files%2Fmap_1532556795502.png?alt=media&token=73c03159-16a9-48cd-a4b5-63476bdefda7', 'https://firebasestorage.googleapis.com/v0/b/resorts-tapped-admin.appspot.com/o/jackson_hole%2Fmap_files%2Fmap_1532556804981.png?alt=media&token=448cc70e-4865-40aa-8664-6639b155cbe5'],
  name: 'Cypress Hills Resort',
  resortId: 'test_resort',
  emergencyGroup
}));

const archiveDataRef = testResortRtdbRef.child('archiveData').push();

writeOperations.push(archiveDataRef.set({
  emergencyGroup
}));

writeOperations.push(testResortRtdbRef.child(`archiveList/${archiveDataRef.key}`).set({
  date: moment().valueOf(),
  description: '',
  name: 'Initial data at resort creation'
}));

writeOperations.push(testResortRtdbRef.child('published').set(archiveDataRef.key));

Promise.all(writeOperations).then(() => {
  console.log('Seed data written');
  process.exit();
}, err => console.error(err));



