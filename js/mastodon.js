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
const { getRandomText } = require('./text')

function getStatuses (accountId) {
  return mastodonClient.get(`accounts/${accountId}/statuses`)
    .then(resp => resp.data)
}

const accountId = 69164

function sendPrivateStatus (inReplyToId, username) {
  const params = {
    in_reply_to_id: inReplyToId,
    status: `${username} ${getRandomText()}`,
    visibility: 'direct'
  }
  return mastodonClient.post('statuses', params).then(resp => resp.data)
}

function deleteStatus(id) {
  return mastodonClient.delete(`statuses/${id}`).then(resp => resp.data)
}

function followUser (accountId) {
  return mastodonClient.post(`accounts/${accountId}/follow`, { reblogs: false })
    .then(resp => resp.data.id)
}

function unfollowUser (accountId) {
  return mastodonClient.post(`accounts/${accountId}/unfollow`, {})
    .then(resp => resp.data.id)
}

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

function compareFollowersToFollowing () {
  return mastodonClient.get('accounts/verify_credentials', {})
    .then(resp => resp.data.id)
    .then(accountId => {
      console.log('account id', accountId)
      return getFollowersAndFollowing(accountId).then(({ followerIds, followingIds }) => {
        // follow users that are following the bot
        const followNewUsersPromises = Promise.all(followerIds.filter(followerId => {
          const isFollowingUser = followingIds.includes(followerId)

          return !isFollowingUser
        })
        .map(followerId => {
          return followUser(followerId)
        }))

        // unfollow users the bot follows that arent following the bot
        const unfollowOldUsersPromises = Promise.all(followingIds.filter(followingId => {
          const isFollowedBackByUser = followerIds.includes(followingId)
          return !isFollowedBackByUser
        }).map(followingId => {
          return unfollowUser(followingId)
        }))

        return Promise.all([followNewUsersPromises, unfollowOldUsersPromises]).then(results => {
          const [ followedUsers, unfollowedUsers ] = results
          return { followedUsers, unfollowedUsers }
        })
      })
  })
}

function sendMessagesToTimeline() {
  const listener = mastodonClient.stream('streaming/user')
  console.log('Listening on the timeline for messages')

  listener.on('message', (message) => {
    console.log('Message', message)
    
    if (message.event === 'delete') {
      const messageId = message.data
      
      getStatuses(accountId).then(statuses => {
        console.log(statuses.map(status => {
          return { id: status.id, in_reply_to_id: status.in_reply_to_id }
        }))
                    
        const statusBotRepliedTo = statuses.find(status => status.in_reply_to_id === messageId)
        if (!statusBotRepliedTo) {
          return console.info('Couldnt find message we replied to')
        }

        console.log(messageId, statusBotRepliedTo.id)
        
        deleteStatus(statusBotRepliedTo.id).then(console.log).catch(console.error)
      })
    }
    
    if (message.event === 'update') {
      if (!doesMessageHaveUnCaptionedImages(message)) {
        return
      }

      const missingData = message.data && message.data.account
      if (!missingData) {
        return
      }

      const messageId = message.data.id
      const username = '@' + message.data.account.acct

      sendPrivateStatus(messageId, username).then(console.log).catch(console.error)
    }
  })

  listener.on('error', err => console.error(err))
}

module.exports = {
  compareFollowersToFollowing,
  sendMessagesToTimeline
}
