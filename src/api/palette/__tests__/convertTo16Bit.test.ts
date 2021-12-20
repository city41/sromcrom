import { convertTo16BitColor, convertTo16BitPalette } from '../convertTo16Bit';
import { Color24Bit, Palette24Bit } from '../types';

describe('convertTo16BitColor', function () {
	it('should convert a 24 bit color to 16 bit', function () {
		const black24: Color24Bit = [0, 0, 0, 255];
		expect(convertTo16BitColor(black24)).toEqual(0x8000);

		const green24: Color24Bit = [0, 255, 0, 255];
		expect(convertTo16BitColor(green24)).toEqual(0x20f0);

		const white24: Color24Bit = [255, 255, 255, 255];
		expect(convertTo16BitColor(white24)).toEqual(0x7fff);
	});

	it('should ignore the alpha channel', function () {
		const black24: Color24Bit = [0, 0, 0, 100];
		expect(convertTo16BitColor(black24)).toEqual(0x8000);

		const green24: Color24Bit = [0, 255, 0, 0];
		expect(convertTo16BitColor(green24)).toEqual(0x20f0);

		const white24: Color24Bit = [255, 255, 255, 0];
		expect(convertTo16BitColor(white24)).toEqual(0x7fff);
	});
});

describe('convertTo16BitPalette', function () {
	it('should convert a palette', function () {
		const palette24: Palette24Bit = [
			[0, 0, 0, 255],
			[128, 0, 0, 255],
		];

		expect(convertTo16BitPalette(palette24)).toEqual([0x8000, 0x800]);
	});
});
