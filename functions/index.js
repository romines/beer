/* eslint-env node */
// const config = JSON.parse(process.env.FIREBASE_CONFIG);

exports.httpEndpoint = require('./httpEndpoint');
exports.generateThumbnail = require('./generateThumbnail');
exports.twitterActivity = require('./twitterActivity');
exports.createPushNotification = require('./createPushNotification');
exports.createTargetedMessage = require('./createTargetedMessage');
exports.getPushNotifications = require('./getPushNotifications');
exports.getPushNotification = require('./getPushNotification');
exports.getTagStats = require('./getTagStats');
exports.exportSubscribers = require('./exportSubscribers');
exports.exportSegment = require('./exportSegment');
exports.getResults = require('./getResults');
exports.getGeoZones = require('./getGeoZones');
exports.getMsgStats = require('./getMsgStats');
exports.getSetSubscribers = require('./tasks/getSetSubscribers');
