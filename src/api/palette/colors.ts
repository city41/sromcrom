import { convertTo16BitColor } from './convertTo16Bit';
import { Color16Bit, Color24Bit } from './types';

export const MAGENTA24: Color24Bit = [255, 0, 255, 255];
export const MAGENTA16: Color16Bit = convertTo16BitColor(MAGENTA24);
export const WHITE24: Color24Bit = [255, 255, 255, 255];
export const WHITE16: Color16Bit = convertTo16BitColor(WHITE24);
export const BLACK24: Color24Bit = [0, 0, 0, 255];
export const BLACK16: Color16Bit = convertTo16BitColor(BLACK24);
export const RED24: Color24Bit = [255, 0, 0, 255];
export const RED16: Color16Bit = convertTo16BitColor(RED24);
export const GREEN24: Color24Bit = [0, 255, 0, 255];
export const GREEN16: Color16Bit = convertTo16BitColor(GREEN24);

export const TRANSPARENT_24BIT_COLOR = MAGENTA24;
export const TRANSPARENT_16BIT_COLOR = MAGENTA16;
