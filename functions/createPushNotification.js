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
  let silentSettings  = req.body.silentSettings

  if (!req.body.messageBody) {
    res.send('WTF');
  } else {

    let requestBody = {
      "request": {
        "application": applicationCode,
        "auth": token, // API access token from Pushwoosh Control Panel
        "notifications": [
          {
            "send_date":        "now",  // required. YYYY-MM-DD HH:mm OR 'now'
            "content":          req.body.messageBody,
            "ios_title":        req.body.messageTitle,
            "android_header":   req.body.messageTitle,
            "data": {
              "message_title":  req.body.messageTitle
            }
          }
        ]
      }
    }

    // Add silent settings
    if (silentSettings) {
      requestBody["request"]["notifications"][0]["dataType"]          = -2
      requestBody["request"]["notifications"][0]["ios_silent"]        = 1
      requestBody["request"]["notifications"][0]["android_silent"]    = 1
      requestBody["request"]["notifications"][0]["validMinutes"]      = silentSettings.validMinutes
      requestBody["request"]["notifications"][0]["repeatInterval"]    = silentSettings.repeatInterval
      requestBody["request"]["notifications"][0]["repeatLimit"]       = silentSettings.repeatLimit
      requestBody["request"]["notifications"][0]["data"]["is_silent"] = true
    }

    // Add geozone info
    if (req.body.geoZone.lat) {
      requestBody["request"]["notifications"][0]["geozone"] = {
        "lat":    req.body.geoZone.lat,
        "lng":    req.body.geoZone.lng,
        "range":  req.body.geoZone.range
      }
    }

    // Add selected cities info
    if (req.body.selectedCities && req.body.selectedCities.length > 0) {
      let array = [ ["City", "IN", req.body.selectedCities ] ]
      requestBody["request"]["notifications"][0]["conditions"] = array
    }

    // Add message link
    if (req.body.messageLink && req.body.messageLink.length > 0) {
      requestBody["request"]["notifications"][0]["link"] = req.body.messageLink
    }

    httpRequest.post({
      url: 'https://cp.pushwoosh.com/json/1.3/createMessage',
      json: requestBody,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      res.status(200).send(response)
    })
  }

});
