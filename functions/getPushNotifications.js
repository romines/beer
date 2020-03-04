/* eslint-env node */

const httpRequest = require('request');
const functions   = require('firebase-functions');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
// const token       = functions.config().pushwoosh.development;
const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.development;

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  let applicationCode = req.query.applicationCode

  let requestBody = {
    "request": {
      "auth":     token, // API access token from Pushwoosh Control Panel
      "searchBy": "applicationCode",  // optional. Possible values are "", "notificationID", "notificationCode", "applicationCode", "campaignCode"
      // "value":    "1DBC6-F4481" // Crystal MTN
      "value":    applicationCode
    }
  }

  let fullRequest = {
    url: 'https://cp.pushwoosh.com/json/1.3/getPushHistory',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  httpRequest.post(fullRequest, (error, response, body) => {
    // TODO add error handling
    res.status(200).send(response)
  })



});
