const fs = require('fs')
const { getRandomText } = require('./text')

const {
  mastodonClient,
  
  getAccountId,
  getStatuses,
  sendStatus,
  deleteStatus,
  
  followUser,
  unfollowUser,
  getFollowersAndFollowing,
  getRelationships
} = require('./mastodon' )

function sendPrivateStatus (inReplyToId, username) {
  const params = {
    in_reply_to_id: inReplyToId,
    status: `${username} ${getRandomText()}`,
    visibility: 'direct'
  }
  return sendStatus(params)
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

function removeUsersWhoShouldntBeSentAFollow(ids) {
  return getRelationships(ids).then(accounts => {
    // console.log('accounts', accounts)

    const removeAlreadyFollowingOrRequestedUsers = accounts.filter(account => {
      // console.log('account', account)
      const isFollowedBy = account.followed_by // might aswell double check this at this point 
      const isntAlreadyRequestingToFollow = !account.requested
      const isntAlreadyFollowing = !account.following
      console.log(account.id, isFollowedBy, isntAlreadyRequestingToFollow, isntAlreadyFollowing)
      return isFollowedBy && isntAlreadyRequestingToFollow && isntAlreadyFollowing
    })

    const accountIds = removeAlreadyFollowingOrRequestedUsers.map(a => a.id)
    
    return accountIds
  })
}

function compareFollowersToFollowing () {
  console.info('Handling new and old followers')
  return getAccountId().then(accountId => {
    return getFollowersAndFollowing(accountId).then(({ followerIds, followingIds }) => {
      // follow users that are following the bot
      // and also havent already been followed or followe request before
      const followersWhoHaventBeenFollowedIds = followerIds.filter(followerId => {
        const isFollowingUser = followingIds.includes(followerId)

        return !isFollowingUser
      })
      console.log('followersWhoHaventBeenFollowedIds', followersWhoHaventBeenFollowedIds)
      const followersWhoWeShouldFollowPromise = removeUsersWhoShouldntBeSentAFollow(
        followersWhoHaventBeenFollowedIds
      )
      return followersWhoWeShouldFollowPromise.then(followersWhoWeShouldFollowIds => {
        console.log('followersWhoWeShouldFollowIds', followersWhoWeShouldFollowIds)
      
        const followNewUsersPromises = Promise.all(
          followersWhoWeShouldFollowIds.map(followerId => {
            return followUser(followerId)
          })
        )

        // unfollow users the bot follows that arent following the bot
        const followingWhoHaveUnfollowedIds = followingIds.filter(followingId => {
          const isFollowedBackByUser = followerIds.includes(followingId)
          return !isFollowedBackByUser
        })      
        const unfollowOldUsersPromises = Promise.all(
          followingWhoHaveUnfollowedIds.map(followingId => {
            return unfollowUser(followingId)
          })
        )

        return Promise.all([followNewUsersPromises, unfollowOldUsersPromises]).then(results => {
          const [ followedUsers, unfollowedUsers ] = results
          return { followedUsers, unfollowedUsers }
        })
      })
    })
  })
}

compareFollowersToFollowing()


function sendMessagesToTimeline() {
  const listener = mastodonClient.stream('streaming/user')
  console.info('Listening on the timeline for messages')

  listener.on('message', (message) => {
    console.info('Message recieved: ', message.event)
    
    if (message.event === 'notification') {
      if (message.data.type !== 'follow') {
        return
      }

      const userId = message.data.account.id
      
      followUser(userId).then(result => {
        console.info('Followed back: ', result)
      }).catch(console.error)
    }
    
    if (message.event === 'delete') {
      const messageId = message.data.toString()
      console.info('Message ID: ', messageId)
      
      getAccountId().then(accountId => {
        getStatuses(accountId).then(statuses => {
          statuses.forEach(status => {
            console.info(status.id, status.in_reply_to_id, messageId, status.in_reply_to_id === messageId)
          })

          const statusBotRepliedTo = statuses.find(status => status.in_reply_to_id === messageId)
          if (!statusBotRepliedTo) {
            return console.info('Couldnt find message we replied to')
          }

          deleteStatus(statusBotRepliedTo.id).then(result => {
            console.info('Deleted status: ', result.id)
          }).catch(console.error)
        })
      })
    }
    
    if (message.event === 'update') {
      console.info('Message ID: ', message.data.id)
      
      if (!doesMessageHaveUnCaptionedImages(message)) {
        return
      }

      const missingData = message.data && message.data.account
      if (!missingData) {
        return
      }

      const messageId = message.data.id
      const username = '@' + message.data.account.acct

      sendPrivateStatus(messageId, username).then(result => {
        console.info('Sent message to: ', result.id)
      }).catch(console.error)
    }
  })

  listener.on('error', err => console.error(err))
}

module.exports = {
  compareFollowersToFollowing,
  sendMessagesToTimeline
}
