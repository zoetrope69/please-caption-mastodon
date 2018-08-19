const fs = require('fs')
const Mastodon = require('mastodon-api')
const mastodonClient = new Mastodon({
  access_token: process.env.MASTODON_ACCESS_TOKEN,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
  api_url: 'https://botsin.space/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

function tootImage(text) {
  return uploadImage(text).then(createStatus)
}

function createStatus(mediaIdStr) {
  return new Promise((resolve, reject) => {
    var params = { status: '', media_ids: [mediaIdStr] }
    return mastodonClient.post('statuses', params, (err, data, response) => {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
}

function uploadImage(text) {
  return new Promise((resolve, reject) => {
    const temporaryFilePath = __dirname + '/images/output.jpg'
    const params = { file: fs.createReadStream(temporaryFilePath), description: text }
    return mastodonClient.post('media', params, (err, data, response) => {
      if (err) {
        return reject(err)
      }

      if (!data.id) {
        return reject('No media ID to use for toot')
      }

      return resolve(data.id)
    })
  })
}

module.exports = tootImage
