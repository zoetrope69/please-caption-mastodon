const { words } = require('./js/grammar.json')
const fetch = require('node-fetch')
const fs = require('fs')

const wordDidntWork = require(__dirname + '/wordsthatdidntwork.json')

words.forEach((word, i) => {
    if (!wordDidntWork.includes(word)) {
      fs.appendFile('wordsthatdidwork.json', '"' + word + '",' + "\n", function (err) {
        if (err) {
          console.error(err)
        }
      })
    }
  console.log(i)
  
  if (i === words.length) console.log('done')
})

