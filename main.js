const createImage = require('./js/images')
const tootImage = require('./js/mastodon')
const getRandomBookKeywordAndTitle = require('./js/bookTitles')
const express = require('express')
const app = express()

require('fs').appendFile('wordsthatdidntwork.txt', 'hi' + '\n', function (err) {
  if (err) {
    console.error(err)
  }
})

function getGooseBumps() {}

app.get('/', (request, response) => {
  const link = '<a href="https://botsin.space/@goosebumps">@goosebumps@botsin.space</a>'
  response.status(200).send(link);
})

app.get('/' + process.env.BOT_ENDPOINT, (request, response) => {
  const { keyword, title } = getRandomBookKeywordAndTitle()
  createImage(keyword, title).then(() => {
    return tootImage(title)
  })
  .then(() => {
    return response.status(200).send('sent a toot!');
  })
  .catch(error => {
    console.error('error:', error);
    
    if (error.includes('No image found for keyword')) {
      
    }
    
    return response.status(500).send(error);
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})