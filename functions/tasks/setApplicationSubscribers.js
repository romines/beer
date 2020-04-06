const Firestore       = require('@google-cloud/firestore');
const httpRequest     = require('request');
const functions       = require('firebase-functions');
const config          = JSON.parse(process.env.FIREBASE_CONFIG);
const token           = config.projectId === 'resorts-tapped-admin' ? functions.config().pushwoosh.production : functions.config().pushwoosh.development;
const projectId       = config.projectId;
const pushWooshEnv    = process.env.NODE_ENV === 'production' ? 'production' : 'staging'
const pwConfig        = require('../static/pwConfig.js');
const parse           = require('csv-parse')
const firestore       = new Firestore({ projectId: projectId, timestampsInSnapshots: true });
const RESORTS_REF     = firestore.collection('resorts')


module.exports = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Headers', "*")
  res.set('Access-Control-Allow-Methods', 'GET')

  const resortId = req.query.resortId

  RESORTS_REF.doc(resortId).get().then((doc) => {
    // Go out and get results
    getApplicationSubscribers(doc).then((response) => {
      // Parse results
      parseResults(response.body).then((results) => {
        // Finally, save results back to Firestore
        let resortData  = doc.data()
        let pwData      = resortData.pushWooshData || {}

        pwData.exportSubscribersCityOptions = results

        RESORTS_REF.doc(resortId).update({ pushWooshData: pwData }).then(() => {
          res.status(200).send('DONE')
        })
      })
    }).catch((error) => {
      res.status(500).send(error)
    })
  })
});


function getApplicationSubscribers(doc) {

  return new Promise((resolve, reject) => {
    let resortData  = doc.data()
    let requestId   = resortData.pushWooshData.exportSubscribers.currentRequestId

    if (!requestId) {
      resolve('No exportSubscribers.currentRequestId present on ' + resortData.resort_id)
      return
    }

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
        reject({ error: parsed.status_message })
      } else {
        let url = parsed.response.url

        if (!url) {
          resolve(response)
        } else {
          httpRequest.get({
            url: url,
            headers: {
              'Content-Type': 'application/json'
            }
          }, (error, response, body) => {
            resolve(response)
          })
        }
      }
    })
  })
}


function parseResults(csvData) {

  return new Promise((resolve, reject) => {
    let cityOptions = {}

    function incrementCityCount(city) {
      let newCityName = city.replace(/,/g, '').replace(/ /g, '_')

      if (cityOptions[newCityName]) {
        let currentValue = cityOptions[newCityName]
        currentValue.count += 1
        cityOptions[newCityName] = currentValue
      } else {
        cityOptions[newCityName] = { cityName: city, count: 1 }
      }
    }

    parse(csvData, {}, (err, output) => {
      output.forEach((row, index) => {
        if (index === 0) return true // Skip headers
        if (row[5]) {
          let parsedRow = JSON.parse(row[5])
          if (parsedRow.City) incrementCityCount(parsedRow.City)
        }
      })
    }).on('end', () => {
      resolve(cityOptions)
    })
  })
}
