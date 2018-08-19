const fs = require('fs')
const Mastodon = require('mastodon-api')
const mastodonClient = new Mastodon({
  access_token: process.env.MASTODON_ACCESS_TOKEN,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
  api_url: 'https://botsin.space/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

function tootImage(b64content) {
  return uploadImage(b64content).then(sendTweet);
}

function sendTweet(mediaIdStr) {
  return new Promise((resolve, reject) => {
    var params = { status: '', media_ids: [mediaIdStr] }
    return mastodonClient.post('statuses', params, (err, data, response) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function uploadImage(b64content) {
  return new Promise((resolve, reject) => {
    const temporaryFilePath = 'temporary.png'
    
    // TODO: is there a way to send the base64 string straight to the file param?
    fs.writeFile(temporaryFilePath, b64content, 'base64', (err) => {
      if (err) {
        return reject(err);
      }
    
      const params = { file: fs.createReadStream(temporaryFilePath) };
      return mastodonClient.post('media', params, (err, data, response) => {
        if (err) {
          return reject(err);
        }

        if (!data.id) {
          return reject('No media ID to use for toot');
        }

        return resolve(data.id);
      });
    }); 
  });
}

module.exports = tootImage;