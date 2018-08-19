const jimp = require('jimp')

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// from https://github.com/oliver-moran/jimp/issues/216
function measureText(font, text) {
  let textWidth = 0
  
  for (var i = 0; i < text.length; i++) {
    const textCharacter = text[i]
    const textCharacterAfter = text[i]
    
    const fontCharacter = font.chars[textCharacter]
    
    if (!fontCharacter) {
      continue
    }
    
    textWidth += fontCharacter.xoffset
    
    if (font.kernings[textCharacter] && font.kernings[textCharacter][textCharacterAfter]) {
      textWidth += font.kernings[text[i]][textCharacterAfter]
    }
      
    if (fontCharacter.xadvance) {
      textWidth += fontCharacter.xadvance
    }
  }
  
  return textWidth
}

const WIDTH = 339
const HEIGHT = 500

const LETTER_WIDTH = 9
const TEXT_PAD = LETTER_WIDTH * 4.5
const MAX_TEXT_LENGTH = 55

function createImage (keyword, text) {
  return new Promise((resolve, reject) => {
    keyword = keyword.toLowerCase()

    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH) + '...'
    }
    text = text.toUpperCase()

    const randomImage = `https://loremflickr.com/${WIDTH}/${HEIGHT}/${encodeURIComponent(keyword)}?random=${randomNumberBetween(0, 20)}`
    const defaultImage = `https://loremflickr.com/${WIDTH}/${HEIGHT}/somethingthatwouldnevercomebackwithanything`

    const isAltCover = randomNumberBetween(0, 1) === 0
    
    const coverImage = isAltCover ? (
      'goosebumps-cover-alt.png'
    ) : (
      'goosebumps-cover.png'
    )
    
    const font = isAltCover ? (
      jimp.FONT_SANS_16_BLACK
    ) : (
      jimp.FONT_SANS_16_WHITE
    )
    
    const textYBuffer = isAltCover ? 50 : 47

    Promise.all([
      jimp.read(defaultImage),
      jimp.read(randomImage),
      jimp.read('../images/' + coverImage),
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
      
      let textXPosition = Math.floor((WIDTH / 2) - (measureText(font, text) / 2))

      const textXPositionTooLow = textXPosition < TEXT_PAD
      if (textXPositionTooLow) {
        textXPosition = TEXT_PAD
      }
      
      const textIsTooLong = text.length > MAX_TEXT_LENGTH
      if (textIsTooLong) {
        textXPosition += TEXT_PAD
      }
      
      const textYPosition = Math.floor(HEIGHT - textYBuffer)

      const textOnImage = mergedImage.print(
        font,
        textXPosition, textYPosition,
        text, WIDTH - textXPosition
      )

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