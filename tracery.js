const tracery = require('tracery-grammar')
const rawGrammar = require('./grammar.json')
const processedGrammar = tracery.createGrammar(rawGrammar)

processedGrammar.addModifiers(tracery.baseEngModifiers)

module.exports.grammar = processedGrammar
