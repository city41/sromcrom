import { Canvas, createCanvas, CanvasRenderingContext2D } from 'canvas';

export function extractSubCanvas(
	sourceContext: CanvasRenderingContext2D,
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
