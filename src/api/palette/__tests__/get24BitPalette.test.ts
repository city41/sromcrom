import { getTestCanvas } from '../../../testUtil';
import {
	BLACK24,
	RED24,
	TRANSPARENT_VIA_ALPHA_24BIT_COLOR,
	TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
	WHITE24,
} from '../colors';
import { get24BitPalette } from '../get24BitPalette';

describe('get24BitPalette', function () {
	it('should append magenta (transparent) to the front of the palette', function () {
		const canvas = getTestCanvas(BLACK24, RED24);

		const extractedPalette = get24BitPalette(canvas);

		expect(extractedPalette).toEqual([
			TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
			BLACK24,
			RED24,
		]);
	});

	it('should not emit alpha transparency into the palette', function () {
		const canvas = getTestCanvas(
			BLACK24,
			RED24,
			TRANSPARENT_VIA_ALPHA_24BIT_COLOR
		);

		const extractedPalette = get24BitPalette(canvas);

		expect(extractedPalette).toEqual([
			TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
			BLACK24,
			RED24,
		]);
	});

	it('should only have unique colors in the palette', function () {
		const canvas = getTestCanvas(
			BLACK24,
			WHITE24,
			RED24,
			BLACK24,
			RED24,
			RED24,
			TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
			TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
			TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
			TRANSPARENT_VIA_MAGENTA_24BIT_COLOR
		);

		const expectedPalette = [
			TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
			BLACK24,
			WHITE24,
			RED24,
		];
		const extractedPalette = get24BitPalette(canvas);

		expect(extractedPalette).toEqual(expectedPalette);
	});
});
