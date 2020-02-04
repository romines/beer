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

  let requestBody = {
    "request": {
      "auth":     token, // API access token from Pushwoosh Control Panel
      "searchBy": "applicationCode",  // optional. Possible values are "", "notificationID", "notificationCode", "applicationCode", "campaignCode"
      "value":    "1DBC6-F4481" // Crystal MTN
    }
  }

  let fullRequest = {
    url: 'https://cp.pushwoosh.com/json/1.3/getPushHistory',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  console.log(fullRequest)

  httpRequest.post(fullRequest, (error, response, body) => {
    // TODO add error handling
    res.status(200).send(response)

    // res.status(200).send({
    //   "rows": [
    //     {
    //       "id":91133,
    //       "createDate":"2015-11-27 07:01:31",
    //       "sendDate":"2015-11-27 07:01:31",
    //       "content":{"en":"This is a big test."},
    //       "url":null,
    //       "filter":"#000Integer(\u226045)",
    //       "richPageId":null,
    //       "geozone":"{\"lat\":55.002825809793,\"lng\":82.905578613281,\"range\":1000}"
    //     },
    //     {
    //       "id":91134,
    //       "createDate":"2015-11-28 11:31:31",
    //       "sendDate":"2015-11-28 11:31:31",
    //       "content":{"en":"The Gondola has been put on hold. There was a lot of wind. This is a really long message. Hooray"},
    //       "url":null,
    //       "filter":"#000Integer(\u226045)",
    //       "richPageId":null,
    //       "geozone":"{\"lat\":55.002825809793,\"lng\":82.905578613281,\"range\":1000}"
    //     },
    //     {
    //       "id":91135,
    //       "createDate":"2015-11-29 15:44:22",
    //       "sendDate":"2015-11-29 15:44:22",
    //       "content":{"en":"We just got a lot of snow"},
    //       "url":null,
    //       "filter":"#000Integer(\u226045)",
    //       "richPageId":null,
    //       "geozone":"{\"lat\":55.002825809793,\"lng\":82.905578613281,\"range\":1000}"
    //     },
    //   ]
    // })
  })



});
