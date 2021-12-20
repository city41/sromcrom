import { createCanvas } from 'canvas';
import { convertTo16BitColor } from './api/palette/convertTo16Bit';
import { Color16Bit, Color24Bit } from './api/palette/types';

export const MAGENTA24: Color24Bit = [255, 0, 255, 255];
export const MAGENTA16: Color16Bit = convertTo16BitColor(MAGENTA24);
export const BLACK24: Color24Bit = [0, 0, 0, 255];
export const BLACK16: Color16Bit = convertTo16BitColor(BLACK24);
export const RED24: Color24Bit = [255, 0, 0, 255];
export const RED16: Color16Bit = convertTo16BitColor(RED24);

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
