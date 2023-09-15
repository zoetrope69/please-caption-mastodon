/**
 * When we receive a delete notification, it'd be nice to see if we replied to the deleted message
 * and if so, delete our reply.
 *
 * In this module we keep a mapping from other people's message IDs to our replies, to aid that.
 *
 * Initial testing shows that we receive about 10~ deletes an hour, a fraction of which we reply to.
 * So a cache of size 10_000 will fill in ~416 days assuming 10% deletes we receive have a reply
 * from us.
 *
 * Under such load, we don't have to check the cache size very frequently. We *do* want to cap the
 * size of the cache to a sane value because we don't want this to be a memory burden. So, every few
 * hours/days, we evict the oldest entries in the cache till it's small enough. (This is easy
 * because JavaScript Maps iterate in insert order.)
 */

const STATUS_TO_REPLY_CACHE = new Map();
const MAX_CACHE_SIZE = 10_000;
const CACHE_CLEAR_TIMEOUT_MS = 1e3 * 3600 * 12;

setInterval(() => {
  const size = STATUS_TO_REPLY_CACHE.size;
  let surplus = size - MAX_CACHE_SIZE;
  if (surplus > 0) {
    for (const entry of STATUS_TO_REPLY_CACHE) {
      STATUS_TO_REPLY_CACHE.delete(entry);
      surplus--;
      if (surplus <= 0) {
        break;
      }
    }
  }
}, CACHE_CLEAR_TIMEOUT_MS);

module.exports = { STATUS_TO_REPLY_CACHE };
