const { createImage } = require('./js/images')
const tootImage = require('./js/mastodon')
const { getRandomText } = require('./js/text')
const express = require('express')
const app = express()

app.use(express.static('public'))

app.get('/', (request, response) => {
  response.status(200)
})

app.get('/' + process.env.BOT_ENDPOINT, (request, response) => {
  const imageFilePath = __dirname + '/public/test.jpg'
  
  const text = getRandomText()
  
  console.log('text')
  
  createImage(imageFilePath).then(() => {
    // return tootImage(imageFilePath, text)
  })
  .then(() => {
    return response.status(200).send('<img src="test.jpg" />');
  })
  .catch(error => {
    console.error('error:', error);
    
    return response.status(500).send(error);
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})