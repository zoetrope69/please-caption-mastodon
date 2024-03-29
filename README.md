# Please Caption Mastodon Bot

Based on [a bot I used to use on Twitter called Please Caption](https://twitter.com/pleasecaption). It would message you when you forgot to put text descriptions (also know as 'alt text' or 'captions').

The difference with this bot is as you can send direct messages to statuses (toots) on Mastodon you can have a less spammy bot that messages privately.

Mastodon also lets you edit toots so you can easily add text descriptions.

## How does the bot work?

You can [follow the bot on @PleaseCaption@botsin.space](https://botsin.space/@PleaseCaption).

When you post any media (images and videos) without text descriptions, it will respond with a message.

## Installing the bot

1. Install dependancies

```bash
npm install
```

2. Create a Mastodon application and get the access token

   > You can do this from the settings in Mastodon. There's a 'Development' section. Give the bot all permissions.

3. Add environment variables

- `MASTODON_API_URL` is the URL for the instance you're on.
- `MASTODON_ACCESS_TOKEN` is the access token from the previous step
- `BOT_ENDPOINT` is the endpoint you'll be sending requests to to get it to run tasks

3. Set-up script to ping bot endpoint.

The bot will unfollow and follow users ever so often when you hit a specific endpoint. If your server is 'https://example.com' and your `BOT_ENDPOINT` is 'specialsecret' the URL would be 'https://example.com/specialsecret'.

Then you can use something like [Uptime Robot](https://Uptimerobot.com) to send requests to that URL ever so often.

## Changelog
- We began notifying people when they boosted un-captioned content (see [PR](https://github.com/zactopus/please-caption-mastodon/pull/5)) but we have reverted this feature because there isn't a reliable way to detect edits to boosts (see [issue](https://github.com/zactopus/please-caption-mastodon/issues/12))