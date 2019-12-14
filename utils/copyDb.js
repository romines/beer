const inquirer = require('inquirer');
const initializeApp = require('./firebaseAdmin.js').initialize;
const environments = require('./firebaseAdmin.js').environments;
const getConfig = require('./firebaseAdmin.js').getConfig;
const questions = [
  {
    type: 'input',
    name: 'source',
    message: 'Copy data from',
  },
  {
    type: 'input',
    name: 'target',
    message: 'Copy data to',
  },
];

async function main() {
  const answers = await inquirer.prompt(questions);
  const { source, target } = answers;

  if (!Object.keys(environments).includes(source)) {
    return console.log('Invalid source environment!!!');
  }
  if (target === 'production' || !Object.keys(environments).includes(target)) {
    return console.log('Invalid target environment!!!');
  }
  const confirmation = await inquirer.prompt({
    type: 'confirm',
    name: 'yes',
    message: `Are you sure you want to continue? This will overwrite all data on ${target}.`,
  });
  if (!confirmation.yes) return;

  const admin = initializeApp(target);
  const sourceConfig = getConfig(source);
  const sourceApp = admin.initializeApp(sourceConfig, 'source');
  const db = admin.firestore();
  const rtdb = admin.database();
  const sourceDb = admin.firestore(sourceApp);
  const sourceRtdb = admin.database(sourceApp);
  db.settings({ timestampsInSnapshots: true });
  sourceDb.settings({ timestampsInSnapshots: true });

  const sourceSnapshot = await sourceDb.collection('resorts').get();
  const sourceIds = [];
  sourceSnapshot.forEach(doc => sourceIds.push(doc.id));

  const targetSnapshot = await db.collection('resorts').get();
  const targetIds = [];
  targetSnapshot.forEach(doc => targetIds.push(doc.id));

  let batch = db.batch();

  targetIds.forEach(resortId => {
    const resortRef = db.collection('resorts').doc(resortId);
    batch.delete(resortRef);
  });

  sourceSnapshot.forEach(doc => {
    const resortId = doc.id;
    const resortData = doc.data();
    let targetRef = db.collection('resorts').doc(resortId);
    batch.set(targetRef, resortData);
  });

  try {
    await batch.commit();
  } catch (error) {
    console.log(error);
  }
  console.log(
    `Successfully copied firestore data from ${source} to ${target}!`
  );

  const copyRtdb = async () => {
    // NB: does not delete extra root nodes that are present in target but not source
    return Promise.all(
      sourceIds.map(async id => {
        const sourceRtdbRef = sourceRtdb.ref(id);
        const sourceArchiveSnapshot = await sourceRtdbRef.once('value');
        const targetRtdbRef = rtdb.ref(id);
        await targetRtdbRef.set(sourceArchiveSnapshot.val());
      })
    );
  };
  await copyRtdb();
  console.log(
    `Successfully copied realtime database data from ${source} to ${target}!`
  );
  process.exit(0);
}
main();
