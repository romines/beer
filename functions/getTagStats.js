/* eslint-env node */

const httpRequest = require('request');
const functions   = require('firebase-functions');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
// const token       = functions.config().pushwoosh.production;
const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.development;

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  let requestBody = {
    "request": {
      "auth":   token,
      "tag":    req.query.tagName
    }
  }

  httpRequest.post({
    url: 'https://cp.pushwoosh.com/json/1.3/getTagStats',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }, (error, response, body) => {

    let parsedResponseBody = JSON.parse(response.body)

    console.log(parsedResponseBody)

    let resultsBody = {
      "request": {
        "auth":       token,
        "request_id": parsedResponseBody.response.request_id
      }
    }

    httpRequest.post({
      url: 'https://cp.pushwoosh.com/json/1.3/getResults',
      body: JSON.stringify(resultsBody),
      headers: {
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      // We need to make another request for the actual CSV
      res.status(200).send(response)
    })
  })



});
