const tracery = require("tracery-grammar");

function jsonToGrammar(json) {
  const grammar = tracery.createGrammar(require(json));
  grammar.addModifiers(tracery.baseEngModifiers);
  return grammar;
}

const [postGrammar, reblogGrammar, fancyFormattingGrammar] = [
  "./grammar.json",
  "./reblogGrammar.json",
  "./fancyFormattingGrammar.json",
].map(jsonToGrammar);

const FAVOURITE_TOOT_TO_DELETE_STRING = "⭐ Favourite this toot to delete it.";

function getFlattenedGrammar(grammar) {
  return grammar.flatten("#origin#");
}

function getRandomTextForPosts() {
  const flattened = getFlattenedGrammar(postGrammar);
  return `${flattened} \n\n${FAVOURITE_TOOT_TO_DELETE_STRING}`;
}
function getRandomTextForReblogs() {
  const flattened = getFlattenedGrammar(reblogGrammar);
  return `${flattened} \n\n${FAVOURITE_TOOT_TO_DELETE_STRING}`;
}
function getRandomTextForFancyFormatting() {
  const flattened = getFlattenedGrammar(fancyFormattingGrammar);
  return `${flattened} \n\n${FAVOURITE_TOOT_TO_DELETE_STRING}`;
}

module.exports = {
  FAVOURITE_TOOT_TO_DELETE_STRING,
  getRandomTextForPosts,
  getRandomTextForReblogs,
  getRandomTextForFancyFormatting,
};
