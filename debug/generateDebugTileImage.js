const fs = require('fs');
const { createCanvas, Image } = require('canvas');


function createDebugTileImage(tileSize, count) {
    const canvas = createCanvas(tileSize * count, tileSize);
    const context = canvas.getContext('2d');

    context.antialias = 'none';
    context.fillStyle = 'rgb(255, 0, 255)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = `${tileSize}px Sans-Serif`;
    context.fillStyle = 'rgb(0, 255, 0)';

    for (let i = 0; i < count; ++i) {
        context.fillText((i+1).toString(), i * tileSize, tileSize, tileSize);
    }

    return canvas.toBuffer('image/png');
}


const imageBuffer = createDebugTileImage(16, 256);

fs.writeFileSync('./debugTiles.png', imageBuffer);