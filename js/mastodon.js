const {
  MASTODON_ACCESS_TOKEN,
  MASTODON_API_URL
} = process.env

if (!MASTODON_ACCESS_TOKEN || !MASTODON_API_URL) {
  console.error('Missing environment variables from Mastodon. See README')
  process.exit(1)
}

const fs = require('fs')
const Mastodon = require('mastodon-api')
const mastodonClient = new Mastodon({
  access_token: MASTODON_ACCESS_TOKEN,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
  api_url: MASTODON_API_URL
})

const listener = mastodonClient.stream('streaming/user')
 
listener.on('message', (message) => {
  console.log('message received')
  if (message.event === 'update') {
    const mediaAttachments = message.data.media_attachments
    const hasMediaAttachents = mediaAttachments.length === 0
    
    const atleastOneAttachmentDoesntHaveACaption = mediaAttachments.some(mediaAttachment => {
      console.log(mediaAttachment)
      const doesntHaveACaption = mediaAttachment.description === null
      return doesntHaveACaption
    })
    
    console.log(atleastOneAttachmentDoesntHaveACaption)
  }
})
 
listener.on('error', err => console.log(err))

function createStatus(mediaIdStr, status) {
  return new Promise((resolve, reject) => {
    const params = { status, media_ids: [mediaIdStr] }
    return mastodonClient.post('statuses', params, (err, data, response) => {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
}

module.exports = {}
