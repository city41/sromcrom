import {
	BLACK24,
	WHITE24,
	getTestCanvas,
	MAGENTA24,
	RED24,
} from '../../../testUtil';
import { get24BitPalette } from '../get24BitPalette';

describe('get24BitPalette', function () {
	it('should append magenta to the front of the palette', function () {
		const canvas = getTestCanvas(BLACK24, RED24);

		const extractedPalette = get24BitPalette(canvas);

		expect(extractedPalette).toEqual([MAGENTA24, BLACK24, RED24]);
	});

	it('should only have unique colors in the palette', function () {
		const canvas = getTestCanvas(
			BLACK24,
			WHITE24,
			RED24,
			BLACK24,
			RED24,
			RED24,
			MAGENTA24,
			MAGENTA24,
			MAGENTA24,
			MAGENTA24
		);

		const expectedPalette = [MAGENTA24, BLACK24, WHITE24, RED24];
		const extractedPalette = get24BitPalette(canvas);

		expect(extractedPalette).toEqual(expectedPalette);
	});
});
