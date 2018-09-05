const {
  compareFollowersToFollowing,
  sendMessagesToTimeline
} = require('./js/mastodon')

sendMessagesToTimeline()

const express = require('express')
const app = express()

app.use(express.static('public'))

app.get('/', (request, response) => {
  response.sendStatus(200)
})

app.get('/' + process.env.BOT_ENDPOINT, (request, response) => {
  compareFollowersToFollowing().then(result => {
    console.log('result', result)
    return response.sendStatus(200)
  }).catch(error => {
    console.error(error)
    return response.status(500).send(error)
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})