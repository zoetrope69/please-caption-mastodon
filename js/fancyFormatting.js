/*
Per https://en.wikipedia.org/wiki/Mathematical_Alphanumeric_Symbols this range
includes upper and lower case Latin letters in various math formats (bold,
script, Fraktur, etc.), as well as Greek letters and 10 Arabic digits.

It does *not* include a number of special symbols that were introduced before
this code block, e.g.:

- U+212C: SCRIPT CAPITAL B
- U+2102: DOUBLE-STRUCK CAPITAL C
- U+210E: PLANCK CONSTANT
- etc.

which Wikipedia currently colors pink. We don't bother with these because we're
being lazy and they're quite few in number. For maximal completeness, we should
add the ~25-ish extra symbols to this regexp.
*/
const MATH_REGEXP = /[\u{1D400}-\u{1D7FF}]{3,}/u;
// We want to be as efficient as possible, so we will use RegExp's `test` method
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
// but for this to work, the regular expression object must be stateless.
// Therefore we omit the `g` modifier.

function hasFancyFormatting(s) {
  return MATH_REGEXP.test(s);
}

module.exports = hasFancyFormatting;

if (module === require.main) {
  const assert = require("assert");

  const mathyTexts = [
    "engagement 𝘰𝘯 𝘔𝘢𝘴𝘵𝘰𝘥𝘰𝘯",
    "You 𝘵𝘩𝘪𝘯𝘬 it's 𝒸𝓊𝓉ℯ to 𝘄𝗿𝗶𝘁𝗲 your tweets and usernames 𝖙𝖍𝖎𝖘 𝖜𝖆𝖞. But have you 𝙡𝙞𝙨𝙩𝙚𝙣𝙚𝙙 to what it 𝘴𝘰𝘶𝘯𝘥𝘴 𝘭𝘪𝘬𝘦 with assistive technologies like 𝓥𝓸𝓲𝓬𝓮𝓞𝓿𝓮𝓻?",
    "𝚤𝚤𝚤 is not really math!",
  ];
  assert(mathyTexts.every(hasFancyFormatting));

  const nonmath = [
    "hello world",
    "𝚤 = sqrt(-1)",
    "山田一郎です",
    "한국어",
    "Όλοι οι άνθρωποι γεννιούνται ελεύθεροι και ίσοι στην αξιοπρέπεια και τα δικαιώματα. Είναι προικισμένοι με λογική και συνείδηση, και οφείλουν να συμπεριφέρονται μεταξύ τους με πνεύμα αδελφοσύνης",
  ];
  assert(nonmath.every((s) => !hasFancyFormatting(s)));

  console.log("ok!");
}
