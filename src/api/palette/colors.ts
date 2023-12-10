import { convertTo16BitColor } from './convertTo16Bit';
import { Color16Bit, Color24Bit } from './types';

export const WHITE24: Color24Bit = [255, 255, 255, 255];
export const WHITE16: Color16Bit = convertTo16BitColor(WHITE24);
export const BLACK24: Color24Bit = [0, 0, 0, 255];
export const BLACK16: Color16Bit = convertTo16BitColor(BLACK24);
export const RED24: Color24Bit = [255, 0, 0, 255];
export const RED16: Color16Bit = convertTo16BitColor(RED24);
export const GREEN24: Color24Bit = [0, 255, 0, 255];
export const GREEN16: Color16Bit = convertTo16BitColor(GREEN24);

export const MAGENTA24: Color24Bit = [255, 0, 255, 255];
export const TRANSPARENT_VIA_ALPHA_24BIT_COLOR: Color24Bit = [0, 0, 0, 0];
export const TRANSPARENT_VIA_MAGENTA_24BIT_COLOR: Color24Bit = [
	255, 0, 255, 255,
];
export const TRANSPARENT_16BIT_COLOR: Color16Bit =
	convertTo16BitColor(MAGENTA24);
