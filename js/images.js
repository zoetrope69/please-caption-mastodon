const fs = require('fs')
const Jimp = require('jimp')
const Canvas = require('canvas')

function alterImage (filePath) {
  return new Promise((resolve, reject) => {
    const url = 'http://fillmurray.com/500/500/'
    return Jimp.read(url, (err, image) => {
      if (err) {
        return reject(err)
      }
      
      image
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(filePath, (err, image) => {
          if (err) {
            return reject(err)
          }
        
          resolve(image)
        })
    })
  })
}

function drawImage (filePath) {
  return new Promise((resolve, reject) => {
    const canvas = new Canvas(200, 200)
    const ctx = canvas.getContext('2d')

    ctx.font = '30px Impact'
    ctx.rotate(.1)
    ctx.fillText("Awesome!", 50, 100)

    const text = ctx.measureText('Awesome!')
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.lineTo(50, 102)
    ctx.lineTo(50 + text.width, 102)
    ctx.stroke()

    fs.writeFile(filePath, canvas.toBuffer(), (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

module.exports = {
  drawImage,
  alterImage
}