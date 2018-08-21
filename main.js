const { createImage } = require('./js/images')
const tootImage = require('./js/mastodon')
const { getRandomText } = require('./js/text')
const express = require('express')
const app = express()

app.get('/', (request, response) => {
  response.status(200).send('the bots runs');
})

app.get('/' + process.env.BOT_ENDPOINT, (request, response) => {
  const imageFilePath = 'test.jpg'
  
  const text = getRandomText()
  
  createImage(imageFilePath).then(() => {
    return tootImage(imageFilePath, title)
  })
  .then(() => {
    return response.status(200).send('sent a toot!');
  })
  .catch(error => {
    console.error('error:', error);
    
    return response.status(500).send(error);
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})