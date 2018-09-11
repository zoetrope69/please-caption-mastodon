const tracery = require('tracery-grammar')
const rawGrammar = require('./grammar.json')
const processedGrammar = tracery.createGrammar(rawGrammar)
processedGrammar.addModifiers(tracery.baseEngModifiers)

function getRandomText () {
  const text = processedGrammar.flatten("#origin#")
  return text
}

module.exports = {
  getRandomText
}
