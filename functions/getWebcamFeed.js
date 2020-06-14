const functions   = require('firebase-functions');
const admin       = require('./initialize');
const firestore   = admin.firestore();

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  const resortId = req.query.resortId

  if (!resortId) {
    res.status(500).send({ error: 'resortId is required' })
    return
  }

  firestore.collection('resorts').doc(resortId).get().then((snapshot) => {
    let cams = snapshot.data().webcams || {}
    res.status(200).send(cams)
  }).catch((error) => {
    console.log(error)
    res.status(200).send(error)
  })

});
