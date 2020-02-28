/* eslint-env node */

const httpRequest = require('request');
const functions   = require('firebase-functions');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
// TODO update this to use prod credentials
const token       = functions.config().pushwoosh.development;
// const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.staging;

// Use production for now just to get messages
// if (process.env.NODE_ENV === 'development') {
//   token = functions.config().pushwoosh.development
// }

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  let requestBody = {
    "request": {
      "auth":         token,
      "application":  req.query.applicationCode
    }
  }

  let request = {
    url: 'https://cp.pushwoosh.com/json/1.3/listGeoZones',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  httpRequest.post(request, (error, response, body) => {
    res.status(200).send(response)
  })



});
