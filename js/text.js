const tracery = require('tracery-grammar')
const grammar = tracery.createGrammar(require('./grammar.json'))
grammar.addModifiers(tracery.baseEngModifiers)
const reblogGrammar = tracery.createGrammar(require('./reblogGrammar.json'))
reblogGrammar.addModifiers(tracery.baseEngModifiers)

function getRandomText (reblog) {
  if (reblog) {
    return reblogGrammar.flatten('#origin#')
  }
  const text = grammar.flatten('#origin#')
  return text
}

module.exports = {
  getRandomText
}
