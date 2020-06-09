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

  // Allow empty messageBody only for tile push
  if (!req.body.messageBody && !req.body.isTilePush) {
    res.send('Message body is required.');
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
              "title":          req.body.messageTitle
            }
          }
        ]
      }
    }

    let notification = requestBody["request"]["notifications"][0]

    // Add silent settings
    if (silentSettings) {
      // iOS stuff...
      notification["ios_root_params"]   =  {
        "aps": {
            "content-available":1,
            "apns-push-type":"background",
            "apns-priority":5,
            "sound":""
        }
      }

      // Omit fields from notifications for iOS
      delete notification['content']
      delete notification['ios_title']

      // Android stuff...
      notification["android_icon"]                = "ic_note"
      notification["android_priority"]            = 0
      notification["android_delivery_priority"]   = "normal"
      notification["android_silent"]              = 1

      // Data stuff...
      notification["data"]["is_silent"]       = true
      notification["data"]["dataType"]        = "-2"
      notification["data"]["message"]         = req.body.messageBody
      notification["data"]["startTime"]       = req.body.startTime || 'now'
      notification["data"]["validMinutes"]    = silentSettings.validMinutes
      notification["data"]["repeatInterval"]  = silentSettings.repeatInterval
      notification["data"]["repeatLimit"]     = silentSettings.repeatLimit
      notification["data"]["priority"]        = silentSettings.isHighPriority ? -1 : 0
    } // END silentSettings if


    // Set tile push settings
    if (req.body.isTilePush) {
      // Omit fields from notifications for iOS
      delete notification['content']
      delete notification['ios_title']

      notification["data"]["priority"]  = 1
      notification["data"]["dataType"]  = "-2"
      notification["data"]["message"]   = req.body.messageBody
      notification["android_silent"]    = 1
      notification["ios_root_params"]   =  {
        "aps": {
            "content-available":1,
            "apns-push-type":"background",
            "apns-priority":5
        }
      }
    } // END isTilePush if


    // Add geozone info
    if (req.body.geoZone.lat) {
      notification["geozone"] = {
        "lat":    req.body.geoZone.lat,
        "lng":    req.body.geoZone.lng,
        "range":  req.body.geoZone.range
      }
    }


    // Add selected cities info
    if (req.body.selectedCities && req.body.selectedCities.length > 0) {
      let array = [ ["City", "IN", req.body.selectedCities ] ]
      notification["conditions"] = array
    }


    // Add message link
    if (req.body.messageLink && req.body.messageLink.length > 0) {
      notification["link"]          = req.body.messageLink
      notification["minimize_link"] = "0"
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
