const Firestore       = require('@google-cloud/firestore');
const httpRequest     = require('request');
const functions       = require('firebase-functions');
const config          = JSON.parse(process.env.FIREBASE_CONFIG);
const projectId       = config.projectId;
const pushWooshEnv    = process.env.NODE_ENV === 'production' ? 'production' : 'staging'
const firestore       = new Firestore({ projectId: projectId, timestampsInSnapshots: true });
const RESORTS_REF     = firestore.collection('resorts')


module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  const resortId = req.query.resortId

  if (!resortId) {
    res.status(500).send({ error: 'resortId is required' })
    return
  }

  RESORTS_REF.doc(resortId).get().then((doc) => {
    let resortData = doc.data()
    let lastPublishedDate = resortData.lastPublishedDate

    if (lastPublishedDate) res.status(200).send({ lastPublished: lastPublishedDate })
    else res.status(200).send({ lastPublished: null })

  }).catch((error) => {
    res.status(200).send(error)
  })
});
