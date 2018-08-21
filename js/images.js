const fs = require('fs')
const Jimp = require('jimp')

function createImage (filePath) {
  return Jimp.read('http://lorempixel.com/500/500/')
    .then(lenna => {
        return lenna
            .resize(256, 256) // resize
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .write(filePath); // save
    })
}

module.exports = {
  createImage
}