/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
const db = admin.database();
const auth = admin.auth();


module.exports = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Origin', "*")
  response.set('Access-Control-Allow-Headers', "*")
  response.set('Access-Control-Allow-Methods', 'DELETE')

  const path = request.params['0']
  const uid = path.substr(1);

  auth.deleteUser(uid).then(() => {
    response.status(200).send('success')
  }).catch((error) => {
    response.status(500).send(error)
  })
});
