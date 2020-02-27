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

  let applicationCode = req.query.applicationCode ? req.query.applicationCode : "F1360-7EBF3" // default to crystal for now

  // TODO remove this and similar
  applicationCode = "1DBC6-F4481" // Crystal MTN

  let requestBody = {
    "request": {
      "auth":         token, // API access token from Pushwoosh Control Panel
      "application":  applicationCode
    }
  }

  let fullRequest = {
    url: 'https://cp.pushwoosh.com/json/1.3/exportSubscribers',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  httpRequest.post(fullRequest, (error, response, body) => {
    // TODO add error handling
    let parsedResponseBody = JSON.parse(response.body)
    var requestId

    if (parsedResponseBody.response) {
      requestId = parsedResponseBody.response.request_id
    } else {
      var phrase      = parsedResponseBody.status_message
      var myRegexp    = /id:(.*)/;
      var match       = myRegexp.exec(phrase);
      requestId       = match[1].trim()
    }

    res.status(200).send(requestId)

  })

});
