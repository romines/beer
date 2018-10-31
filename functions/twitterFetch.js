/* eslint-env node */
module.exports = function (cachedTwitterData) {
  if (!cachedTwitterData) {
    return Promise.resolve('no cached tweet . . . we should probably fetch!');
  }
};