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

  let requestId = req.query.requestId

  let requestBody = {
    "request": {
      "auth":       token,
      "request_id": requestId
    }
  }

  let request = {
    url: 'https://cp.pushwoosh.com/json/1.3/getResults',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  httpRequest.post(request, (error, response, body) => {
    // One case of error
    // {
    //   status_code: 420,
    //   status_message: 'Request is still being processed',
    //   response: null
    // }

    // Expected response body
    // {"status_code":200,"status_message":"OK","response":{"url":"https:\\/\\/export.pushwoosh.com\\/devices\\/a1345091d2670b9ee92a278e309c5153.csv"}}

    let parsed  = JSON.parse(response.body)

    if (!parsed.response) {
      res.status(200).send({ error: parsed.status_message })
    } else {
      let url = parsed.response.url

      if (!url) {
        res.status(200).send(response)
      } else {
        httpRequest.get({
          url: url,
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          res.status(200).send(response)
        })
      }
    }

  })



});
