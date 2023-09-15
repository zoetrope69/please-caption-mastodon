const fs = require("fs");
const { getRandomText } = require("./text");

const {
  mastodonClient,

  getAccountId,
  getStatuses,
  sendStatus,
  deleteStatus,

  followUser,
  unfollowUser,
  getFollowersAndFollowing,
  getRelationships,
} = require("./mastodon");
const { FAVOURITE_TOOT_TO_DELETE_STRING } = require("./text");
const { STATUS_TO_REPLY_CACHE } = require("./replyCache");
const db = require("./db");

function sendPrivateStatus(inReplyToId, username, reblog) {
  db.warnTootedUncaptioned();
  const params = {
    in_reply_to_id: inReplyToId,
    status: `${username} ${getRandomText(reblog)}`,
    visibility: "direct",
  };
  return sendStatus(params);
}

function doesMessageHaveUnCaptionedImages(message) {
  if (message.reblog) {
    // We don't have a simple and reliable way to detect edited reblogs, so just skip this for now.
    // However, log this. `search` here because per #12 the `/search` endpoint seems to fetch edits
    // from the remote server?
    const possiblyUncaptionedBoost = doesMessageHaveUnCaptionedImages(
      message.reblog
    );
    if (possiblyUncaptionedBoost) {
      db.search();
    }
    return;
  }

  const mediaAttachments = message.media_attachments;
  const hasMediaAttachments = mediaAttachments.length > 0;

  if (!hasMediaAttachments) {
    return false;
  }

  const atleastOneAttachmentDoesntHaveACaption = mediaAttachments.some(
    (mediaAttachment) => {
      const doesntHaveACaption = mediaAttachment.description === null;
      return doesntHaveACaption;
    }
  );

  return atleastOneAttachmentDoesntHaveACaption;
}

function removeUsersWhoShouldntBeSentAFollow(ids) {
  return getRelationships(ids).then((accounts) => {
    const removeUsers = accounts.filter((account) => {
      const isFollowedBy = account.followed_by; // might aswell double check this at this point
      const isntAlreadyRequestingToFollow = !account.requested;
      const isntAlreadyFollowing = !account.following;
      const isntMuted = !account.muting;

      return (
        isFollowedBy &&
        isntAlreadyRequestingToFollow &&
        isntAlreadyFollowing &&
        isntMuted
      );
    });

    const accountIds = removeUsers.map((a) => a.id);

    return accountIds;
  });
}

function compareFollowersToFollowing() {
  console.info("Handling new and old followers");
  return getAccountId().then((accountId) => {
    return getFollowersAndFollowing(accountId).then(
      ({ followerIds, followingIds }) => {
        // follow users that are following the bot
        // and also havent already been followed or followe request before
        const followersWhoHaventBeenFollowedIds = followerIds.filter(
          (followerId) => {
            const isFollowingUser = followingIds.includes(followerId);
            return !isFollowingUser;
          }
        );
        const followersWhoWeShouldFollowPromise =
          removeUsersWhoShouldntBeSentAFollow(
            followersWhoHaventBeenFollowedIds
          );
        const followNewUsersPromises = followersWhoWeShouldFollowPromise.then(
          (followersWhoWeShouldFollowIds) => {
            return Promise.all(
              followersWhoWeShouldFollowIds.map((followerId) => {
                return followUser(followerId);
              })
            );
          }
        );

        // unfollow users the bot follows that arent following the bot
        const followingWhoHaveUnfollowedIds = followingIds.filter(
          (followingId) => {
            const isFollowedBackByUser = followerIds.includes(followingId);
            return !isFollowedBackByUser;
          }
        );
        const unfollowOldUsersPromises = Promise.all(
          followingWhoHaveUnfollowedIds.map((followingId) => {
            return unfollowUser(followingId);
          })
        );

        return Promise.all([
          followNewUsersPromises,
          unfollowOldUsersPromises,
        ]).then((results) => {
          const [followedUsers, unfollowedUsers] = results;
          return { followedUsers, unfollowedUsers };
        });
      }
    );
  });
}

function processNotificationEvent(message) {
  const { status, account, type } = message.data;

  // if a user follows the bot
  if (type === "follow") {
    followUser(account.id)
      .then((result) => {
        console.info("Followed back: ", result);
      })
      .catch(console.error);
  }

  // if a user favourites the bot's toot
  if (type === "favourite") {
    // check if it's a deletable toot
    if (!status.content.includes(FAVOURITE_TOOT_TO_DELETE_STRING)) {
      return;
    }

    /*
      delete the bot's toot the user favourited
      as it's a direct message from the bot
      we do not need to check who favourited it
    */
    db.deleteBecauseTheyFaved();
    deleteStatus(status.id)
      .then((result) => {
        console.info("Deleted status via user favourite: ", result.id);
      })
      .catch(console.error);
  }
}

function processDeleteEvent(message) {
  const messageId = message.data.toString();
  console.info("Message ID: ", messageId);

  if (STATUS_TO_REPLY_CACHE.has(messageId)) {
    const ourReply = STATUS_TO_REPLY_CACHE.get(messageId);
    db.deleteBecauseTheyDeleted();
    deleteStatus(ourReply)
      .then((result) => {
        STATUS_TO_REPLY_CACHE.delete(messageId);
        console.info("Deleted status: ", result.id);
      })
      .catch(console.error);
  } else {
    db.deletedNothingThoTheyDeleted();
    return console.info("Couldnt find message we replied to");
  }
}

function proccessUpdateEvent(message) {
  console.info("Message ID: ", message.data.id);

  if (!doesMessageHaveUnCaptionedImages(message.data)) {
    return;
  }

  const missingData = message.data && message.data.account;
  if (!missingData) {
    return;
  }

  const messageId = message.data.reblog
    ? message.data.reblog.id
    : message.data.id;
  const username = "@" + message.data.account.acct;

  sendPrivateStatus(messageId, username, message.data.reblog)
    .then((result) => {
      console.info("Sent message to: ", result.id);
      STATUS_TO_REPLY_CACHE.set(messageId, result.id);
    })
    .catch(console.error);
}

function listenAndProcessTootTimeline() {
  const listener = mastodonClient.stream("streaming/user");
  console.info("Listening on the timeline for messages");

  listener.on("message", (message) => {
    console.info("Message recieved: ", message.event);

    if (message.event === "notification") {
      processNotificationEvent(message);
    }

    if (message.event === "delete") {
      processDeleteEvent(message);
    }

    if (message.event === "update") {
      proccessUpdateEvent(message);
    }
  });

  listener.on("error", (err) => console.error(err));
}

module.exports = {
  compareFollowersToFollowing,
  listenAndProcessTootTimeline,
};
