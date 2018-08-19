const tracery = require('tracery-grammar')
const rawGrammar = require('./grammar.json')
const processedGrammar = tracery.createGrammar(rawGrammar)
processedGrammar.addModifiers(tracery.baseEngModifiers)


function getRandomBookKeywordAndTitle () {
  const keywordAndTitleString = processedGrammar.flatten("#origin#")
  const [keyword, title] =  keywordAndTitleString.split(';')
  return { keyword, title }
}

module.exports = getRandomBookKeywordAndTitle
