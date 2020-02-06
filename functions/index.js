/* eslint-env node */
// const config = JSON.parse(process.env.FIREBASE_CONFIG);

exports.httpEndpoint = require('./httpEndpoint');
exports.generateThumbnail = require('./generateThumbnail');
exports.twitterActivity = require('./twitterActivity');
exports.createPushNotification = require('./createPushNotification');
exports.getPushNotifications = require('./getPushNotifications');
exports.getPushNotification = require('./getPushNotification');
exports.getTagStats = require('./getTagStats');
