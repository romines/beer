// published version, sugarbush 12.12 -LvvVZfPqyKSEsd1vBiO
const initializeApp = require('../firebaseAdmin.js').initialize;
const getConfig = require('../firebaseAdmin.js').getConfig;

async function main() {
  const admin = initializeApp('staging');
  const sourceConfig = getConfig('production');
  const sourceApp = admin.initializeApp(sourceConfig, 'source');
  const db = admin.firestore();
  const sourceDb = admin.database(sourceApp);
  db.settings({ timestampsInSnapshots: true });

  const sourceRef = sourceDb.ref('sugarbush/archiveData/-LtznMy8uHC8Oly8tztC');
  const targetRef = db.collection('resorts').doc('sugarbush');
  const sourceSnapshot = await sourceRef.once('value');
  const targetSnapshot = await targetRef.get();
  const november = sourceSnapshot.val();
  const december = targetSnapshot.data();
  let swaps = 0;

  const swapIdsForGroup = group => {
    const novemberGroup = november.contactGroups.filter(
      ({ id }) => id === group.id
    ).length
      ? november.contactGroups.filter(({ id }) => id === group.id)[0]
      : null;
    if (!novemberGroup) {
      console.log(`source group not found for ${group.section}`);
      return group;
    }
    const swapIdsForContact = contact => {
      const novemberContact = novemberGroup.list.filter(
        ({ id }) => id === contact.id
      ).length
        ? novemberGroup.list.filter(({ id }) => id === contact.id)[0]
        : null;
      if (!novemberContact) {
        console.log(`source contact not found for ${contact.name}`);
        return contact;
      }
      if (!contact.coordinates) return contact;
      const newCoordinates = {};
      if (contact.coordinates['1574100689292']) {
        debugger;
        if (novemberContact.coordinates['1574100689292']) {
          if (
            novemberContact.coordinates['1574100689292'] !==
            contact.coordinates['1574100689292']
          ) {
            newCoordinates['1576175797734'] =
              contact.coordinates['1574100689292'];
            newCoordinates['1574100689292'] =
              novemberContact.coordinates['1574100689292'];
          }
          swaps += 1;
        }
      }

      return { ...contact, coordinates: { ...newCoordinates } };
    };

    return {
      ...group,
      list: group.list.map(swapIdsForContact),
    };
  };
  console.log(`swaps: ${swaps}`);
  const contactGroups = december.contactGroups.map(swapIdsForGroup);

  // const batch = db.batch();
  // const ref = db.collection('resorts').doc('jackson_hole');
  // batch.update(ref, { contactGroups });

  debugger;

  // try {
  //   // await batch.commit();
  // } catch (error) {
  //   console.log(error);
  // }
  // console.log(`Successfully did the thing!`);
  process.exit(0);
}
main();
