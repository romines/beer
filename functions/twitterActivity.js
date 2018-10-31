/* eslint-env node */
const functions = require('firebase-functions');
const database = require('./initialize').database();
const moment = require('moment');
const Twitter = require('twit');
const twitter = new Twitter({
    consumer_key: functions.config().twitter.key,
    consumer_secret: functions.config().twitter.secret,
    app_only_auth: true
  });

module.exports = functions.https.onRequest((request, response) => {

  const resortId = request.query.r;

  database.ref(`${resortId}/lastTweet`).once('value')

    .then(snapshot => {
      return parseTweet(snapshot.val(), resortId);
    })
    .then(lastTweet => {
      response.send(JSON.stringify(lastTweet));
    })
    .catch(function(error) {
      response.send(error);
    });

});

function parseTweet(cachedTwitterData, resortId) {

  if (process.env.GCLOUD_PROJECT !== 'resorts-tapped-admin') return Promise.resolve('Tweets not fetched in non-production environments . . .');
  if (!cachedTwitterData || !cachedTwitterData.user || !cachedTwitterData.user.screen_name) return Promise.resolve(`Twitter cache not configured for resortId ${resortId}`);
  if (isFresh(cachedTwitterData)) return Promise.resolve(cachedTwitterData);

  // screen_name populated in firebase manually (before first tweet can be retrieved),
  // subsequently retrieved from cache to avoid extra resort meta lookup

  const screen_name = cachedTwitterData.user.screen_name;

  return new Promise((resolve, reject) => {

    twitter.get('statuses/user_timeline', { screen_name, count: 1}, (err, response) => {
      if (err) return reject(err);
      const lastTweet = response[0];

      updateCache(resortId, lastTweet).then(lastTweet => {
        return resolve(lastTweet);
      });

    });
  });

}

function updateCache(resortId, tweet) {
  const tweetData = {
    ...tweet,
    fetched: moment().format()
  };
  const ref = database.ref(`${resortId}/lastTweet`);
  return ref.set(tweetData).then(() => {
    return Promise.resolve(tweetData);
  });
}

function isFresh(tweet) {
  if (!tweet.text) return false;
  const fetched = moment(tweet.fetched);
  const now = moment();
  return now.diff(fetched, 'minutes') < 10;
}