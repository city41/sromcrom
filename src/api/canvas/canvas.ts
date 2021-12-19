import fs from 'fs';
import {
	Canvas,
	createCanvas,
	Image,
	NodeCanvasRenderingContext2D,
} from 'canvas';

export function getCanvasContextFromImagePath(imagePath: string) {
	const buffer = fs.readFileSync(imagePath);
	const image = new Image();
	image.src = buffer;

	const canvas = createCanvas(image.width, image.height);
	const context = canvas.getContext('2d');

	context.drawImage(image, 0, 0);

	return context;
}

export function extractSubCanvas(
	sourceContext: NodeCanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number
): Canvas {
	const destCanvas = createCanvas(width, height);
	const destCanvasContext = destCanvas.getContext('2d');

	destCanvasContext.drawImage(
		sourceContext.canvas,
		x,
		y,
		width,
		height,
		0,
		0,
		width,
		height
	);

	return destCanvas;
}
