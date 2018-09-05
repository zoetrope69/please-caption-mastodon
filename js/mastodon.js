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

function followUser (accountId) {
  return mastodonClient.post(`accounts/${accountId}/follow`, { reblogs: false })
    .then(resp => resp.data)
}

function unfollowUser (accountId) {
  return mastodonClient.post(`accounts/${accountId}/follow`, {})
    .then(resp => resp.data)
}

function getFollowersAndFollowing (accountId) {
  const followerIdsPromise = mastodonClient.get(`accounts/${accountId}/followers`, {})
        .then(resp => resp.data)
        .then(users => users.map(user => user.id))

  const followingIdsPromise = mastodonClient.get(`accounts/${accountId}/following`, {})
        .then(resp => resp.data)
        .then(users => users.map(user => user.id))
  
  return Promise.all([followerIdsPromise, followingIdsPromise]).then(results => {
    const [followerIds, followingIds] = results
    return { followerIds, followingIds }
  })
}

function compareFollowersToFollowing (accountId) {
  return getFollowersAndFollowing(accountId).then(({ followerIds, followingIds }) => {
    console.log(followerIds, followingIds)
    
    followerIds.forEach(followerId => {
      const isFollowingFollower = followingIds.includes(followerId)
      
      if (!isFollowingFollower) {
      
      }
      
      console.log('isFollowingFollower', isFollowingFollower, followerId)
    })
    
    followingIds.forEach(followingId => {
      const isntFollowingFoller = followerIds.includes(followingId)
      
      if (!isFollowerOfFollowing) {
        unfollowUser(followingId).then(console.log).catch(console.error)
      }
      
      console.log('isFollowerOfFollowing', isFollowerOfFollowing, followingId)
    })
    
    return 'hi'
  })
}

compareFollowersToFollowing(69164).then(console.log).catch(console.error)

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

        if (message.event !== 'update') {
          return false
        }

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
