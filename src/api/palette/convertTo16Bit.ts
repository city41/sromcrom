import { Color16Bit, Color24Bit, Palette16Bit, Palette24Bit } from './types';

export function convertTo16BitColor(color24: Color24Bit): Color16Bit {
	let [red, green, blue] = color24;

	const luma = Math.floor(54.213 * red + 182.376 * green + 18.411 * blue) & 1;

	red = Math.floor(red / 8);
	green = Math.floor(green / 8);
	blue = Math.floor(blue / 8);

	const packed16BitColor =
		((luma ^ 1) << 15) |
		((red & 1) << 14) |
		((green & 1) << 13) |
		((blue & 1) << 12) |
		((red & 0x1e) << 7) |
		((green & 0x1e) << 3) |
		(blue >> 1);

	return packed16BitColor;
}

export function convertTo16BitPalette(palette24: Palette24Bit): Palette16Bit {
	return palette24.map(convertTo16BitColor) as Palette16Bit;
}
