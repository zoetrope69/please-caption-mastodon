const tracery = require("tracery-grammar");
const grammar = tracery.createGrammar(require("./grammar.json"));
grammar.addModifiers(tracery.baseEngModifiers);
const reblogGrammar = tracery.createGrammar(require("./reblogGrammar.json"));
reblogGrammar.addModifiers(tracery.baseEngModifiers);

const FAVOURITE_TOOT_TO_DELETE_STRING = "⭐ Favourite this toot to delete it.";

function getFlattenedGrammar(reblog) {
  if (reblog) {
    return reblogGrammar.flatten("#origin#");
  }

  return grammar.flatten("#origin#");
}

function getRandomText(reblog) {
  const flattenendGrammar = getFlattenedGrammar(reblog);
  return `${flattenendGrammar} \n\n${FAVOURITE_TOOT_TO_DELETE_STRING}`;
}

module.exports = {
  FAVOURITE_TOOT_TO_DELETE_STRING,
  getRandomText,
};
