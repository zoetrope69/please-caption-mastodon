const tracery = require('tracery-grammar')
const rawGrammar = require('./grammar.json')
const processedGrammar = tracery.createGrammar(rawGrammar)
processedGrammar.addModifiers(tracery.baseEngModifiers)


function getRandomBookTitle () {
  const wordAndTitleString = processedGrammar.flatten("#origin#")
  console.log(wordAndTitleString)
  const [word, title] =  wordAndTitleString.split(';')
  console.log(word, title)
}

module.exports = {
  getRandomBookTitle
}
