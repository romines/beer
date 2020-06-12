const functions   = require('firebase-functions');
const admin       = require('./initialize');
const db          = admin.database();

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  const resortId = req.query.resortId

  if (!resortId) {
    res.status(500).send({ error: 'resortId is required' })
    return
  }

  db.ref(resortId).once('value').then((snapshot) => {
    let cams = snapshot.val().webcams || {}
    res.status(200).send(cams)
  }).catch((error) => {
    console.log(error)
    res.status(200).send(error)
  })
});
