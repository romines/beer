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

  // This is buggy. Currently, this function gets called twice, even though client only makes one DELETE request
  // So, just return 200 every time, and log result
  auth.deleteUser(uid).then(() => {
    console.log('SUCCESS')
  }).catch(() => {
    console.log('ERROR')
  })

  response.status(200).send()
});
