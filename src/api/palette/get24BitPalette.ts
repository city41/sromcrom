import { Canvas } from 'canvas';
import { Color24Bit, Palette24Bit } from './types';
import uniqBy from 'lodash/uniqBy';
import { TRANSPARENT_VIA_MAGENTA_24BIT_COLOR } from './colors';
import { isEqual } from 'lodash';

export function raw24BitColorToString(r24c: Color24Bit): string {
	return `r24c-${r24c.join(',')}`;
}

export function get24BitPalette(canvas: Canvas): Palette24Bit {
	const rgbImageData = canvas
		.getContext('2d')
		.getImageData(0, 0, canvas.width, canvas.height).data;

	let colors: Color24Bit[] = [];

	for (let i = 0; i < rgbImageData.length; i += 4) {
		colors.push(Array.from(rgbImageData.slice(i, i + 4)) as Color24Bit);
	}

	// make sure all palettes have transparent
	// first remove it if present, both versions: true transparent and magenta
	colors = colors.filter(
		(c) => !isEqual(c, TRANSPARENT_VIA_MAGENTA_24BIT_COLOR) && c[3] === 255
	);
	// then add transparent, ensuring it stays in the front
	colors.unshift(TRANSPARENT_VIA_MAGENTA_24BIT_COLOR);
	// make sure all colors are unique
	colors = uniqBy(colors, raw24BitColorToString) as Palette24Bit;

	return colors as Palette24Bit;
}
