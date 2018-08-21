const fs = require('fs')
const Canvas = require('canvas')

function drawImage (imageFilePath) {
  return new Promise((resolve, reject) => {
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

    fs.writeFileSync(imageFilePath, canvas.toBuffer(), (err) => {
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