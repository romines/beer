/* eslint-env node */
const config = JSON.parse(process.env.FIREBASE_CONFIG);

exports.httpEndpoint = require('./httpEndpoint');
exports.generateThumbnail = require('./generateThumbnail');
if (config.projectId === 'resorts-tapped-admin') {
  exports.twitterActivity = require('./twitterActivity');
}
