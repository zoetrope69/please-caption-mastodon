const fs = require('fs')
const Jimp = require('jimp')

function createImage (filePath) {
  return new Promise((resolve, reject) => {
    const url = 'http://lorempixel.com/500/500/'
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

module.exports = {
  createImage
}