/* eslint-env node */
var admin = require("./firebaseAdmin.js");
var fs = require('fs');

// var collectionName = process.argv[2];
var collectionName = 'resorts';

var db = admin.firestore();

var data = {};
data[collectionName] = {};

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
  fs.writeFile("firestore-export.json", JSON.stringify(data), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
})