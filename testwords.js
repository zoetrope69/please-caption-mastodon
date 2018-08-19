const { words } = require('./js/grammar.json')
const fetch = require('node-fetch')
const fs = require('fs')

const word = 'somethingthatwouldnevercomebackwithanything'
// const word = 'dog'

fetch(`https://loremflickr.com/1/1/${word}`).then(response => {
  console.log(response.url)
  if (response.url.includes('defaultImage')) {
    console.log(word + ' Didnt find image')
    
    fs.appendFile('wordsthatdidntwork.txt', word + "\n", function (err) {
      if (err) {
        console.error(err)
      }
    })
    
    return
  }

  console.log(word + ' Found image')
})

