const {
  MASTODON_ACCESS_TOKEN,
  MASTODON_API_URL,
  MASTODON_CLIENT_KEY,
  MASTODON_CLIENT_SECRET
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

function doesMessageHaveUnCaptionedImages(message) {
  if (message.event !== 'update') {
    return false
  }
  
  const mediaAttachments = message.data.media_attachments
  const hasMediaAttachments = mediaAttachments.length > 0

  if (!hasMediaAttachments) {
    return false
  }

  const atleastOneAttachmentDoesntHaveACaption = mediaAttachments.some(mediaAttachment => {
    const doesntHaveACaption = mediaAttachment.description === null
    return doesntHaveACaption
  })

  return atleastOneAttachmentDoesntHaveACaption
}

function listenOnTimelineForMessages() {
  mastodonClient.get('accounts/verify_credentials', {})
    .then(resp => {
      const accountId = resp.data.id
      console.log(accountId)
      const followerIds = mastodonClient.get(`accounts/${accountId}/followers`, {})
        .then(resp => resp.data)
        .then(followers => followers.map(follower => follower.id))
      
      return followerIds
    })
    .then(followerIds => {
      const listener = mastodonClient.stream('streaming/user')

      listener.on('message', (message) => {
        console.log('message received')

        if (doesMessageHaveUnCaptionedImages(message)) {
          console.log(message)
        }
      })

      listener.on('error', err => console.log(err))
    })
    .catch(console.error)
}

listenOnTimelineForMessages()

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
