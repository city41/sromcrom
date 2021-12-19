import { Canvas } from 'canvas';
import { Color24Bit, Palette24Bit } from './types';
import uniqBy from 'lodash/uniqBy';
import { TRANSPARENT_24BIT_COLOR } from './transparentColor';

export function raw24BitColorToString(r24c: Color24Bit): string {
	return `r24c-${r24c.join(',')}`;
}

export function get24BitPalette(canvas: Canvas): Palette24Bit {
	const rgbImageData = canvas
		.getContext('2d')
		.getImageData(0, 0, canvas.width, canvas.height).data;

	const colors: Color24Bit[] = [];

	for (let i = 0; i < rgbImageData.length; i += 4) {
		colors.push(Array.from(rgbImageData.slice(i, i + 4)) as Color24Bit);
	}

	// make sure all palettes have magenta/transparent
	colors.unshift(TRANSPARENT_24BIT_COLOR);

	return uniqBy(colors, raw24BitColorToString) as Palette24Bit;
}
