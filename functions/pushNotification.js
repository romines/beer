/* eslint-env node */

const httpRequest     = require('request');
const functions   = require('firebase-functions');
const admin       = require('./initialize');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
// TODO update this to use prod credentials
const token       = functions.config().pushwoosh.staging;
// const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.staging;

if (process.env.NODE_ENV === 'development') {
  token = functions.config().pushwoosh.development
}

module.exports = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Origin', "*")
  response.set('Access-Control-Allow-Headers', "*")
  response.set('Access-Control-Allow-Methods', 'GET, POST')

  // Example input: {"message": "Hello!"}
  // if (req.body.message === undefined) {
  //   // This is an error case, as "message" is required.
  //   res.status(400).send('No message defined!');
  // } else {
  //   // Everything is okay.
  //   console.log(req.body.message);
  //
  //   request.get('https://maker.ifttt.com/trigger/arrival/with/key/xxxx', function (error, response, body) {
  //     console.log('error:', error); // Print the error if one occurred
  //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //     console.log('body:', body); //Prints the response of the request.
  //   });
  //   res.status(200).send("Success");
  // }

  let requestBody = {
    "request": {
      "application": "F1BD9-25481", // Pushwoosh application code. TODO change this
      "auth": token, // API access token from Pushwoosh Control Panel
      "notifications": [
        {
          // Content settings
          "send_date": "now",  // required. YYYY-MM-DD HH:mm OR 'now'
          "ignore_user_timezone": true, // or false, required
          "timezone": "America/New_York", // optional. If ignored UTC-0 is default for "send_date". See http://php.net/manual/timezones.php for supported timezones.
          "content": request.body.messageBody,
          // "link": "http://google.com", // optional, string. For deeplinks add "minimize_link":0
          "platforms": [1,2,3,5,7,8,9,10,11,12,13], // optional. 1 — iOS; 2 — BB; 3 — Android; 5 — Windows Phone; 7 — OS X; 8 — Windows 8; 9 — Amazon; 10 — Safari; 11 — Chrome; 12 — Firefox; 13 - IE11; ignored if "devices" < 10
          "send_rate": 100, // optional. Throttling. Valid values are from 100 to 1000 pushes/second.
          // Frequency capping params
          "capping_days": 30, // Amount of days for frequency capping (max 30 days)
          "capping_count": 10, // The max number of pushes that can be sent from a specific app to a particular device within a 'capping_days' period. In case the message created exceeds the 'capping_count' limit for a device, it won't be sent to that device.

          //filters and conditions
          "filter": "FILTER_NAME", // optional
          "dynamic_content_placeholders": { // optional. Placeholders for dynamic content instead of device tags.
            "firstname": "John",
            "lastname": "Doe"
          },
        }
      ]
    }
  }

  console.log(token)
  console.log(request.body)
  console.log("+++++++++++++++++++++++++")

  httpRequest.post({ url: 'https://cp.pushwoosh.com/json/1.3/createMessage', data: JSON.stringify(requestBody) }, (error, response, body) => {
    console.log(error)
    console.log(response)
    console.log(body)
  })

  setTimeout(() => {
    response.send('Success');
  }, 1500)

});
