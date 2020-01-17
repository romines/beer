/* eslint-env node */

// const request = require('request');
const functions   = require('firebase-functions');
const admin       = require('./initialize');
const config      = JSON.parse(process.env.FIREBASE_CONFIG);
const token       = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.development;

module.exports = functions.https.onRequest((request, response) => {
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
  console.log(token)
  response.send('MEOW');
});
