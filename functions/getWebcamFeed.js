const Firestore       = require('@google-cloud/firestore');
const httpRequest     = require('request');
const functions       = require('firebase-functions');
const config          = JSON.parse(process.env.FIREBASE_CONFIG);
const token           = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.development;
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
    let webcams = resortData.webcams

    if (!webcams) webcams = {}

    res.status(200).send(webcams)

  }).catch((error) => {
    console.log(error)
    res.status(200).send(error)
  })
});
