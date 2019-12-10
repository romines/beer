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

  console.log(`Copying data from ${source} to ${target}`);
  const admin = initializeApp(target);
  const sourceConfig = getConfig(source);
  const sourceApp = admin.initializeApp(sourceConfig, 'source');
  const db = admin.firestore();
  const sourceDb = admin.firestore(sourceApp);
  db.settings({ timestampsInSnapshots: true });
  sourceDb.settings({ timestampsInSnapshots: true });

  const sourceSnapshot = await sourceDb.collection('resorts').get();
  const sourceDocsArray = [];
  sourceSnapshot.forEach(doc => sourceDocsArray.push(doc.data()));

  const targetSnapshot = await db.collection('resorts').get();
  const targetDocsArray = [];
  targetSnapshot.forEach(doc => targetDocsArray.push(doc.data()));

  db.collection('test')
    .doc('foo')
    .set({ bar: 'baz' });
}

main();
