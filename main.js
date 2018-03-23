const createImage = require('./images')
const express = require('express')

const app = express()

app.get('/', (request, response) => {
  response.sendStatus(200)
})

app.get('/:keyword/:text', (request, response) => {
  const { keyword, text } = request.params

  if (!keyword || !text) {
    console.error('No keyword/text sent')

    response.status(500).send('No keyword/text sent')
  }

  createImage(keyword, text).then(b64String => {
    const image = new Buffer(b64String.split(',')[1], 'base64');

    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    })

    response.end(image)
  })
  .catch(error => {
    console.error(error)

    response.status(500).send(error)
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})