/* eslint-env node */

const httpRequest = require('request');
const functions   = require('firebase-functions');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
// TODO update this to use prod credentials
const token       = functions.config().pushwoosh.production;
// const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.staging;

// Use production for now just to get messages
// if (process.env.NODE_ENV === 'development') {
//   token = functions.config().pushwoosh.development
// }

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  console.log(req.query.messageId)

  let requestBody = {
    "request": {
      "auth":     token,
      "message":  req.query.messageId
    }
  }

  httpRequest.post({
    url: 'https://cp.pushwoosh.com/json/1.3/getMessageDetails',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }, (error, response, body) => {
    res.status(200).send(response)
  })



});
