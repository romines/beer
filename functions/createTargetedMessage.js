/* eslint-env node */

const httpRequest = require('request');
const functions   = require('firebase-functions');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.development;

// if (process.env.NODE_ENV === 'development') {
//   token = functions.config().pushwoosh.development
// }

module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'POST')

  let applicationCode = req.query.applicationCode

  if (!req.body.messageBody) {
    res.send('WTF');
  } else {

    let requestBody = {
      "request": {
        // CAREFUL
        // We need the applicationCode in devices_filter here, otherwise it will send to ALL devices for ALL applications!!
        "devices_filter":   'A("' + applicationCode + '") * T("basedistance", BETWEEN, [0, 20000])',
        "auth":             token, // API access token from Pushwoosh Control Panel
        "send_date":        "now",  // required. YYYY-MM-DD HH:mm OR 'now'
        "content":          req.body.messageBody,
        "ios_title":        req.body.messageTitle,
        "android_header":   req.body.messageTitle,
        "data": {
          "message_title":  req.body.messageTitle
        }
      }
    }

    // Add message link
    if (req.body.messageLink && req.body.messageLink.length > 0) {
      requestBody["request"]["link"] = req.body.messageLink
    }

    httpRequest.post({
      url: 'https://cp.pushwoosh.com/json/1.3/createTargetedMessage',
      json: requestBody,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      res.status(200).send(response)
    })
  }

});
