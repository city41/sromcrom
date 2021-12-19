import { convertTo16BitColor } from './convertTo16Bit';
import { Color24Bit } from './types';

export const TRANSPARENT_24BIT_COLOR: Color24Bit = [255, 0, 255, 255];
export const TRANSPARENT_16BIT_COLOR = convertTo16BitColor(
	TRANSPARENT_24BIT_COLOR
);
