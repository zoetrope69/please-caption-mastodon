/**
 * Usage database
 *
 * To get a better sense of how much load we're putting on botsin.space, we need to save some usage
 * data. This module
 * 1. creates and loads a simple SQLite database,
 * 2. exports a few functions that the bot can call to indicate when its hitting a certain endpoint,
 * 3. and finally, every few minutes, it'll dump aggregated data to the database.
 *
 * We are tracking:
 * 1. deletes because when we get a delete notification, we hit a REST endpoint to get the last few
 *    toots we've sent to see if we should delete our DM. I suspect this is inefficient because we
 *    only get ~20 of our most recent DMs. I think it'd be more efficient to keep a list of statuses
 *    we've replied to in memory instead of loading the server.
 * 2. `search` and `warnTootedUncaptioned` because this is a proposed way to detect whether a boost
 *    lacking image captions has been edited.
 * 3. `relationships` because this will be used to detect STOP requests to unfollow (see #14)
 */

const { STATUS_TO_REPLY_CACHE } = require("./replyCache");

// Initialize and load the db
const db = require("better-sqlite3")(".data/logs.db");
db.pragma("journal_mode = WAL");

db.prepare(
  `create table if not exists _metadata (schemaVersion integer not null)`
).run();
const versionRows = db.prepare(`select count(*) from _metadata`).get();
if (versionRows === 0) {
  db.prepare(`insert into _metadata (schemaVersion) values (1)`);
}

db.prepare(
  `create table if not exists logs (
    unixMillis float not null,
    windowSeconds float not null,
    data text not null)`
).run();

// Prepare in-memory object to track endpoint requests
function initializeRequests() {
  return {
    deleteStatus: 0,
    deleteBecauseTheyDeleted: 0,
    deleteBecauseTheyFaved: 0,
    deletedNothingThoTheyDeleted: 0,
    relationships: 0,
    search: 0,
    warnTootedUncaptioned: 0,
    // warnBoostedUncaptioned: 0,
  };
}
let requestsPerType = initializeRequests();

// These are the functions the bot should call whenever its hitting one of these endpoints
function deleteStatus() {
  requestsPerType.deleteStatus++;
}
function deleteBecauseTheyDeleted() {
  requestsPerType.deleteBecauseTheyDeleted++;
}
function deleteBecauseTheyFaved() {
  requestsPerType.deleteBecauseTheyFaved++;
}
function deletedNothingThoTheyDeleted() {
  requestsPerType.deletedNothingThoTheyDeleted++;
}
function search() {
  requestsPerType.search++;
}
function relationships() {
  requestsPerType.relationships++;
}
function warnTootedUncaptioned() {
  requestsPerType.warnTootedUncaptioned++;
}

// Timer to write aggregated usage to the database every few minutes
const WINDOW_SECONDS = 30 * 60;
const insertStatement = db.prepare(`insert into logs values (?, ?, ?)`);
const dbInterval = setInterval(() => {
  requestsPerType.cacheSize = STATUS_TO_REPLY_CACHE.size;
  insertStatement.run(
    Date.now(),
    WINDOW_SECONDS,
    JSON.stringify(requestsPerType)
  );
  requestsPerType = initializeRequests();
}, WINDOW_SECONDS * 1e3);

module.exports = {
  deleteBecauseTheyDeleted,
  deleteBecauseTheyFaved,
  deletedNothingThoTheyDeleted,
  deleteStatus,
  relationships,
  search,
  warnTootedUncaptioned,
};
