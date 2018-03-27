const jimp = require('jimp')

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const WIDTH = 339
const HEIGHT = 500

const LETTER_WIDTH = 9
const TEXT_PAD = 30
const MAX_TEXT_LENGTH = 55

function createImage (keyword, text) {
  return new Promise((resolve, reject) => {
    keyword = keyword.toLowerCase()

    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH) + '...'
    }

    // const randomImage = `https://loremflickr.com/${WIDTH}/${HEIGHT}/${encodeURIComponent(keyword)}?random=${randomNumberBetween(0, 20)}`
    const randomImage = `https://fillmurray.com/${WIDTH}/${HEIGHT}`
    // const defaultImage = `https://loremflickr.com/${WIDTH}/${HEIGHT}/somethingthatwouldnevercomebackwithanything`
    const defaultImage = `https://fillmurray.com/${WIDTH}2/${HEIGHT}`

    const coverImage = randomNumberBetween(0, 1) === 0 ? (
      'goosebumps-cover.png'
    ) : (
      'goosebumps-cover-alt.png'
    )
    
    const font = coverImage === 'goosebumps-cover-alt.png' ? (
      jimp.FONT_SANS_16_BLACK
    ) : (
      jimp.FONT_SANS_16_WHITE
    )

    Promise.all([
      jimp.read(defaultImage),
      jimp.read(randomImage),
      jimp.read(coverImage),
      jimp.loadFont(font)
    ]).then(loadedAssets => {
      const [defaultImage, loadedImage, goosebumpsImage, font] = loadedAssets

      const comparisonBetweenImageAndDefaultImage = jimp.distance(defaultImage, loadedImage)
      const isDefaultImage = comparisonBetweenImageAndDefaultImage <= 0.1

      if (isDefaultImage) {
        return reject(`No image found for keyword: ${keyword} (${comparisonBetweenImageAndDefaultImage})`)
      }

      const huePosition = randomNumberBetween(0, 360)
      const hueRotatedCover = goosebumpsImage.color([
        { apply: 'hue', params: [huePosition] }
      ])

      const mergedImage = loadedImage
        .posterize(6)
        .composite(hueRotatedCover, 0, 0)
      
      let xPos = Math.floor((WIDTH - (TEXT_PAD * 2) - (LETTER_WIDTH * text.length)) / 2)
      console.log(xPos, WIDTH, LETTER_WIDTH * text.length, text.length)
      
      if (xPos < TEXT_PAD) {
        xPos = TEXT_PAD
      }
      
      if (text.length > 40) {
        xPos = 0
      }

      const textOnImage = mergedImage
        .print(font, xPos, HEIGHT - 47.5, text.toUpperCase(), WIDTH - TEXT_PAD)

      const outputPath = 'output.' + textOnImage.getExtension()

      textOnImage.getBase64(jimp.AUTO, (error, base64OfMergedImage) => {
        if (error) {
          return reject(error)
        }

        return resolve(base64OfMergedImage)
      })
    })
    .catch(err => {
      reject(err)
    })
 })
}

module.exports = createImage