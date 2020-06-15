const Firestore       = require('@google-cloud/firestore');
const httpRequest     = require('request');
const functions       = require('firebase-functions');
const config          = JSON.parse(process.env.FIREBASE_CONFIG);
const token           = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.development;
const PROJECTID       = config.projectId;
const COLLECTION_NAME = 'resorts';
const pushWooshEnv    = process.env.NODE_ENV === 'production' ? 'production' : 'staging'
const pwConfig        = require('../static/pwConfig.js');

const firestore = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true,
});

const RESORTS_REF = firestore.collection(COLLECTION_NAME)



module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  RESORTS_REF.get().then((querySnapshot) => {
    let docs = []
    querySnapshot.forEach((shot) => { docs.push(shot) })

    Promise.all(docs.map((doc) => { return getSetRequestIdForDoc(doc) })).then((values) => {
      res.status(200).send(values)
    }).catch((error) => {
      console.log('WOOF')
      res.status(500).send(error)
    })
  })

});

function getSetRequestIdForDoc(doc) {
  return new Promise((resolve, reject) => {

    let applicationCode = pwConfig[pushWooshEnv][doc.id]

    if (!applicationCode) {
      resolve({ status: 'Doc not set in pwConfig file', id: doc.id})
    } else {
      fetchSubscriberRequestId(applicationCode).then((requestId) => {
        let resortData  = doc.data()
        let pwData      = resortData.pushWooshData || {}

        pwData.exportSubscribers = pwData.exportSubscribers ? pwData.exportSubscribers : {}

        pwData.exportSubscribers.lastRequestId    = pwData.exportSubscribers.currentRequestId || ''
        pwData.exportSubscribers.currentRequestId = requestId

        RESORTS_REF.doc(doc.id).update({ pushWooshData: pwData }).then(() => {
          resolve('SUCCESS')
        }).catch((error) => {
          reject(error)
        })
      }).catch((error) => {
        reject(error)
      })
    }
  })

}

function fetchSubscriberRequestId(applicationCode) {

  let requestBody = {
    "request": {
      "auth":         token, // API access token from Pushwoosh Control Panel
      "application":  applicationCode
    }
  }

  let fullRequest = {
    url: 'https://cp.pushwoosh.com/json/1.3/exportSubscribers',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return new Promise((resolve, reject) => {
    httpRequest.post(fullRequest, (error, response, body) => {
      // TODO add error handling

      if (!response) return

      let parsedResponseBody = JSON.parse(response.body)
      var requestId

      if (parsedResponseBody.response) {
        requestId = parsedResponseBody.response.request_id
      } else {
        var phrase      = parsedResponseBody.status_message
        var myRegexp    = /id:(.*)/;
        var match       = myRegexp.exec(phrase);
        requestId       = match[1].trim()
      }
      resolve(requestId)
    })
  })
}
