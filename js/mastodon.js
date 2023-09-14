const { MASTODON_ACCESS_TOKEN, MASTODON_API_URL } = process.env;
const db = require("./db");

if (!MASTODON_ACCESS_TOKEN || !MASTODON_API_URL) {
  console.error("Missing environment variables from Mastodon. See README");
  process.exit(1);
}

const parseLinkHeader = require("parse-link-header");
const Mastodon = require("mastodon-api");
const mastodonClient = new Mastodon({
  access_token: MASTODON_ACCESS_TOKEN,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  api_url: MASTODON_API_URL,
});

function paginatedMastodonResponse(url, allData = []) {
  const MAX_PAGE_COUNT = 10;
  let pageCount = 0;

  return mastodonClient.get(url).then((data) => {
    const newAllData = allData.concat(data.data);

    if (pageCount > MAX_PAGE_COUNT) {
      return newAllData;
    }

    const parsedLinkHeader =
      data.resp.headers.link && parseLinkHeader(data.resp.headers.link);
    if (!parsedLinkHeader) {
      return newAllData;
    }

    if (!parsedLinkHeader.next) {
      return newAllData;
    }

    const newUrl = parsedLinkHeader.next.url;
    return paginatedMastodonResponse(newUrl, newAllData);
  });
}

function getAccountId() {
  return mastodonClient
    .get("accounts/verify_credentials", {})
    .then((resp) => resp.data.id);
}

function getStatuses(accountId) {
  return mastodonClient
    .get(`accounts/${accountId}/statuses`)
    .then((resp) => resp.data);
}

function sendStatus(params) {
  return mastodonClient.post("statuses", params).then((resp) => resp.data);
}

function deleteStatus(id) {
  db.deleteStatus();
  return mastodonClient.delete(`statuses/${id}`).then((resp) => resp.data);
}

function followUser(accountId) {
  return mastodonClient
    .post(`accounts/${accountId}/follow`, { reblogs: true })
    .then((resp) => resp.data.id);
}

function unfollowUser(accountId) {
  db.unfollow();
  return mastodonClient
    .post(`accounts/${accountId}/unfollow`, {})
    .then((resp) => resp.data.id);
}

function getFollowersAndFollowing(accountId) {
  const followerIdsPromise = paginatedMastodonResponse(
    `accounts/${accountId}/followers`
  )
    .then((accounts) => accounts.filter((account) => !account.moved))
    .then((accounts) => accounts.map((account) => account.id));

  const followingIdsPromise = paginatedMastodonResponse(
    `accounts/${accountId}/following`
  ).then((accounts) => accounts.map((account) => account.id));

  return Promise.all([followerIdsPromise, followingIdsPromise]).then(
    (results) => {
      const [followerIds, followingIds] = results;
      return { followerIds, followingIds };
    }
  );
}

function getRelationships(ids) {
  db.relationships();
  return mastodonClient
    .get("accounts/relationships", { id: ids })
    .then((resp) => resp.data);
}

module.exports = {
  mastodonClient,

  getAccountId,
  getStatuses,
  sendStatus,
  deleteStatus,

  followUser,
  unfollowUser,
  getFollowersAndFollowing,
  getRelationships,
};
