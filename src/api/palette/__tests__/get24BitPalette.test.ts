import { createCanvas } from 'canvas';
import { get24BitPalette } from '../get24BitPalette';
import { Color24Bit } from '../types';

const MAGENTA: Color24Bit = [255, 0, 255, 255];
const BLACK: Color24Bit = [0, 0, 0, 255];
const RED: Color24Bit = [255, 0, 0, 255];

function getTestCanvas(data: Uint8ClampedArray) {
	const width = data.length / 4;
	const height = 1;

	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');

	const imageData = context.createImageData(width, height);
	imageData.data.set(data);

	context.putImageData(imageData, 0, 0);

	return canvas;
}

describe('get24BitPalette', function () {
	it('should append magenta to the front of the palette', function () {
		const canvas = getTestCanvas(Uint8ClampedArray.from([BLACK, RED].flat(1)));

		const extractedPalette = get24BitPalette(canvas);

		expect(extractedPalette).toEqual([MAGENTA, BLACK, RED]);
	});

	it('should only have unique colors in the palette', function () {
		const canvas = getTestCanvas(
			Uint8ClampedArray.from([BLACK, RED, BLACK, RED, RED, MAGENTA].flat(1))
		);

		const extractedPalette = get24BitPalette(canvas);

		expect(extractedPalette).toEqual([MAGENTA, BLACK, RED]);
	});
});
