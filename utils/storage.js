/* eslint-env node */
const ONE_WEEK = '604800';
const admin = require('./firebaseAdmin.js').initialize;
const storage = admin.storage();

function processFiles() {

  const bucketName = 'resorts-tapped-admin.appspot.com';

  storage
    .bucket(bucketName)
    .getFiles()
    .then(results => {
      const files = results[0];

      console.log(`printing metadata for ${files.length} files . . .`);
      files.forEach(file => {
        getMetadata(bucketName, file.name)
        // setCacheControl(bucketName, file.name)
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

}

function getMetadata(bucketName, filename) {

  // Gets the metadata for the file
  storage
    .bucket(bucketName)
    .file(filename)
    .getMetadata()
    .then(results => {
      const metadata = results[0];
      console.log(`File: ${metadata.name}`);
      console.log(`Size: ${metadata.size}`);
      console.log(`Cache-control: ${metadata.cacheControl}`);
      console.log(`Updated: ${metadata.updated}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

}

function setCacheControl(bucketName, filename) {

  storage
    .bucket(bucketName)
    .file(filename)
    .setMetadata({
      cacheControl: `public, max-age=${ONE_WEEK}`
    })
    // .then(response => console.log(response))
    .catch(err => {
      console.error('ERROR:', err);
    });

}

processFiles();