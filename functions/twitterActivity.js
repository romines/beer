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
  const handle = request.query.h;

  database.ref(`${resortId}/twitter`).once('value')

    .then(snapshot => {
      return parseTwitterData(snapshot.val(), resortId, handle);
    })
    .then(lastTweet => {
      response.send(JSON.stringify(lastTweet));
    })
    .catch(function(error) {
      response.send(error);
    });

});

function parseTwitterData(twitterData, resortId, handle) {

  if (process.env.GCLOUD_PROJECT !== 'resorts-tapped-admin') return Promise.resolve('Tweets not fetched in non-production environments . . .');
  if (!twitterData || !twitterData.screenName) return Promise.resolve(`Twitter cache not configured for resortId ${resortId}`);
  if (isFresh(twitterData.lastTweet)) return Promise.resolve(twitterData.lastTweet);

  // screenName must be added to firebase rtdb manually (before first tweet can be retrieved)

  const screen_name = handle ? handle : twitterData.screenName;

  return new Promise((resolve, reject) => {

    twitter.get('statuses/user_timeline', { screen_name, count: 20, exclude_replies: true }, (err, response) => {
      if (err) return reject(err);

      let lastTweet;
      if (!response[0] && twitterData.lastTweet) {
        lastTweet = twitterData.lastTweet;
      } else {
        lastTweet = response[0];
      }

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
  const ref = database.ref(`${resortId}/twitter/lastTweet`);
  return ref.set(tweetData).then(() => {
    return Promise.resolve(tweetData);
  });
}

function isFresh(tweet) {
  if (!tweet || !tweet.text) return false;
  const fetched = moment(tweet.fetched);
  const now = moment();
  return now.diff(fetched, 'minutes') < 10;
}