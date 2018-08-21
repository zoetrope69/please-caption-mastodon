const fs = require('fs')
const Canvas = require('canvas')
const Image = Canvas.Image
const canvas = new Canvas(200, 200)
const ctx = canvas.getContext('2d')

ctx.font = '30px Impact';
ctx.rotate(.1);
ctx.fillText("Awesome!", 50, 100);

const text = ctx.measureText('Awesome!');
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + text.width, 102);
ctx.stroke();

function drawImage () {
  return new Promise((resolve, reject) => {
    fs.writeFileSync(__dirname + '/public/draw-test.png', canvas.toBuffer(), (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

module.exports = {
  drawImage
}