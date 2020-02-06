/* eslint-env node */

const httpRequest = require('request');
const functions   = require('firebase-functions');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
// TODO update this to use prod credentials
const token       = functions.config().pushwoosh.development;
// const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.staging;

if (process.env.NODE_ENV === 'development') {
  token = functions.config().pushwoosh.development
}

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'POST')

  if (!req.body.messageBody) {
    res.send('WTF');
  } else {

    let requestBody = {
      "request": {
        "application": "FD90D-D956E", // Jackson Dev
        "auth": token, // API access token from Pushwoosh Control Panel
        "notifications": [
          {
            "send_date": "now",  // required. YYYY-MM-DD HH:mm OR 'now'
            "content": req.body.messageBody
          }
        ]
      }
    }

    let notifications = {
      // Content settings
      "send_date": "now",  // required. YYYY-MM-DD HH:mm OR 'now'
      "content": req.body.messageBody
      // "link": "http://google.com", // optional, string. For deeplinks add "minimize_link":0
      // "platforms": [1,2,3,5,7,8,9,10,11,12,13] // optional. 1 — iOS; 2 — BB; 3 — Android; 5 — Windows Phone; 7 — OS X; 8 — Windows 8; 9 — Amazon; 10 — Safari; 11 — Chrome; 12 — Firefox; 13 - IE11; ignored if "devices" < 10
    }

    // let stringRequest
    // requestBody["request"]["notifications"] = [notifications]

    console.log(requestBody)

    httpRequest.post({
      url: 'https://cp.pushwoosh.com/json/1.3/createMessage',
      data: requestBody,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      // let fakeResponse = {
      //   "status_code": 200,
      //   "status_message": "OK",
      //   "response": {
      //     "Messages": [
      //       "C3F8-C3863ED4-334AD4F1" // message code
      //     ]
      //   }
      // }
      // res.status(200).send(fakeResponse)
      res.status(200).send(response)
    })
  }



});
