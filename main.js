const createImage = require('./images')
const express = require('express')

const app = express()

app.get('/:keyword', (request, response) => {
  const { keyword } = request.params

  if (!keyword) {
    console.error('No keyword sent')

    response.sendStatus(500)

  }

  createImage(keyword).then(b64String => {
    const image = new Buffer(b64String.split(',')[1], 'base64');

    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    })

    response.end(image)
  })
  .catch(error => {
    console.error(error)

    response.sendStatus(500)
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})