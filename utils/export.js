/* eslint-env node */
var admin = require("./firebaseAdmin.js");
var fs = require('fs');

var collectionName = process.argv[2] ? process.argv[2] : 'resorts';
var fileName = process.argv[3] ? process.argv[3] : 'firestore-export.json';

var db = admin.firestore();

var data = {};
data[collectionName] = {};

console.log('NOTE: exporting from production . . .');

var results = db.collection(collectionName)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      data[collectionName][doc.id] = doc.data();
    })
    return data;
  })
  .catch(error => {
    console.log(error);
  })

results.then(data => {
  // Write collection to JSON file
  fs.writeFile(fileName, JSON.stringify(data), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
})