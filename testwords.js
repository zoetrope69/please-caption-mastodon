const { words } = require('./js/grammar.json')
const fetch = require('node-fetch')
const fs = require('fs')

console.log(words.length)
// const wordToGetTo = 900
// words.slice(wordToGetTo - 300, wordToGetTo).forEach(word => {
//   fetch(`https://loremflickr.com/1/1/${word}`).then(response => {
//     console.log(response.url)
//     if (response.url.includes('defaultImage')) {
//       if (word === words[wordToGetTo]) console.log(word + ' Didnt find image')

//       fs.appendFile('wordsthatdidntwork.txt', '"' + word + '",' + "\n", function (err) {
//         if (err) {
//           console.error(err)
//         }
//       })


//       return
//     }

//  if (word === words[wordToGetTo]) console.log(word + ' Found image')
//   })
// })

