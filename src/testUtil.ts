import { createCanvas } from 'canvas';
import { Color24Bit } from './api/palette/types';

export function getTestCanvas(...colors: Color24Bit[]) {
	const data = Uint8ClampedArray.from(colors.flat(1));
	const width = data.length / 4;
	const height = 1;

	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');

	const imageData = context.createImageData(width, height);
	imageData.data.set(data);

	context.putImageData(imageData, 0, 0);

	return canvas;
}
