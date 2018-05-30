/* eslint-env node */
const functions = require('firebase-functions');
const admin = require('./initialize');
const db = admin.firestore();
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const ONE_WEEK = '604800';


module.exports = functions.storage.object().onFinalize((object, context) => {
  const filePath = object.name;

  // Exit if this is triggered on a file that is not an image.
  if (!object.contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  // Get the file name.
  const fileName = path.basename(filePath).split('.')[0] + '.png';
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith('scaled_')) {
    console.log('Already scaled.');
    return null;
  }

  // Exit if this is a move or deletion event.
  if (object.resourceState === 'not_exists') {
    console.log('This is a deletion event.');
    return null;
  }

  // Exit if file exists but is not new and is only being triggered
  // because of a metadata change.
  if (object.resourceState === 'exists' && object.metageneration > 1) {
    console.log('This is a metadata change event.');
    return null;
  }

  // Download file from bucket.
  const bucket = gcs.bucket(object.bucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);

  console.log(object.metadata);
  const resortId = object.metadata.resortId
  const metadata = {
    contentType: object.contentType,
    cacheControl: `public, max-age=${ONE_WEEK}`
  };
  // let fileName;
  return bucket.file(filePath).download({
    destination: tempFilePath,
  }).then(() => {
    console.log('Image downloaded locally to', tempFilePath);
    // Generate a thumbnail using ImageMagick.
    const magickOptions = [tempFilePath, '-filter', 'Triangle', '-define', 'filter:support=2', '-thumbnail', '800x800>', '-unsharp', '0.25x0.25+8+0.065', '-dither', 'None', '-posterize', '136', '-quality', '82', '-define', 'jpeg:fancy-upsampling=off', '-define', 'png:compression-filter=5', '-define', 'png:compression-level=9', '-define', 'png:compression-strategy=1', '-define', 'png:exclude-chunk=all', '-interlace', 'none', '-colorspace', 'sRGB', '-strip', tempFilePath]
    return spawn('convert', magickOptions);
  }).then(() => {
    console.log('Thumbnail created at', tempFilePath);
    // We add a 'scaled_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
    const thumbFileName = `scaled_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    // Uploading the thumbnail.
    return bucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata: metadata,
    });
    // Once the thumbnail has been uploaded delete the local file to free up disk space.
  })
  .then(() => {
    return db.collection('resorts').doc(resortId).collection('scaledImages').doc(fileName.split('.')[0]).set({ scaled: true })
  })
  .then(() => fs.unlinkSync(tempFilePath), error => console.log(error.message));
});