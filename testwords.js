const { words } = require('./js/grammar.json')
const fetch = require('node-fetch')
const fs = require('fs')

const wordDidntWork = require('wordsthatdidntwork.json')
console.log(wordDidntWork[0])

// console.log(words.length)
// const wordToGetTo = 1956
// console.log(words[wordToGetTo])
// words.slice(wordToGetTo - 300, wordToGetTo + 1).forEach(word => {
//   fetch(`https://loremflickr.com/1/1/${word}`).then(response => {
//     if (response.url.includes('defaultImage')) {
//       if (word === words[wordToGetTo ]) console.log(word + ' Didnt find image')

//       fs.appendFile('wordsthatdidntwork.json', '"' + word + '",' + "\n", function (err) {
//         if (err) {
//           console.error(err)
//         }
//       })


//       return
//     }
//    if (word === words[wordToGetTo]) console.log(word + ' Found image')
//   }).catch(console.error)
// })

