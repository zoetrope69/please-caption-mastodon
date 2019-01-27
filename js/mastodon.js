const {
  MASTODON_ACCESS_TOKEN,
  MASTODON_API_URL
} = process.env

if (!MASTODON_ACCESS_TOKEN || !MASTODON_API_URL) {
  console.error('Missing environment variables from Mastodon. See README')
  process.exit(1)
}

const Mastodon = require('mastodon-api')
const mastodonClient = new Mastodon({
  access_token: MASTODON_ACCESS_TOKEN,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
  api_url: MASTODON_API_URL
})

function getAccountId () {
  return mastodonClient.get('accounts/verify_credentials', {})
      .then(resp => resp.data.id)
}

function getStatuses (accountId) {
  return mastodonClient.get(`accounts/${accountId}/statuses`)
    .then(resp => resp.data)
}

function sendStatus (params) {
  return mastodonClient.post('statuses', params).then(resp => resp.data)
}

function deleteStatus (id) {
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


const parseLinkHeader = require('parse-link-header');

getAccountId().then(accountId => {
  mastodonClient.get(`accounts/${accountId}/followers`, {}).then(data => {
    console.log(data.data.length)
    console.log(parseLinkHeader(data.resp.headers.link))
  })
})

function paginatedMastodonResponse(url) {
  mastodonClient.get(`accounts/${accountId}/followers`, {}).then(data => {
    console.log(data.data.length)
    console.log(parseLinkHeader(data.resp.headers.link))
  })
}


module.exports = {
  mastodonClient,
  
  getAccountId,
  getStatuses,
  sendStatus,
  deleteStatus,
  
  followUser,
  unfollowUser,
  getFollowersAndFollowing
}
