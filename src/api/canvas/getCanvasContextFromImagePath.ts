import fs from 'fs';
import { createCanvas, Image } from 'canvas';

export function getCanvasContextFromImagePath(imagePath: string) {
	const buffer = fs.readFileSync(imagePath);
	const image = new Image();
	image.src = buffer;

	const canvas = createCanvas(image.width, image.height);
	const context = canvas.getContext('2d');

	context.drawImage(image, 0, 0);

	return context;
}
