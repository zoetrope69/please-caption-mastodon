const { CronJob } = require('cron')
const express = require('express')
const app = express()
const {
  compareFollowersToFollowing,
  sendMessagesToTimeline
} = require('./js/bot')

sendMessagesToTimeline()

// every hour
const job = new CronJob('0 * * * *', function() {
  console.log('Cronjob triggered')
  compareFollowersToFollowing().then(result => {
    console.log('Compared successfully')
  }).catch(error => {
    console.error(error)
  })
}, null, true, 'Europe/London')

app.use(express.static('public'))

app.get('/', (request, response) => {
  response.sendStatus(200)
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})