/* eslint-env node */

const httpRequest = require('request');
const functions   = require('firebase-functions');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
// TODO update this to use prod credentials
const token       = functions.config().pushwoosh.staging;
// const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.staging;

// Use production for now just to get messages
if (process.env.NODE_ENV === 'development') {
  token = functions.config().pushwoosh.development
}

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  console.log(req.query.messageId)

  let requestBody = {
    request:{
      auth:     token,
      message:  req
    }
  }

  httpRequest.post({
    url: 'https://cp.pushwoosh.com/json/1.3/getMessageDetails',
    data: requestBody,
    dataType: "json"
  }, (error, response, body) => {
    res.status(200).send({
      "id": 2068991743,
      "created": "2016-09-14 17:19:42",
      "send_date": "2016-09-14 17:19:41",
      "status": "done",
      "content": {
        "en": "Hello Good Sir! 🚀"
      },
      "platforms": "[1]",
      "ignore_user_timezone": "1",
      "code": "XXXX-92B4C3C5-A7F5EF70"
    })
  })



});
