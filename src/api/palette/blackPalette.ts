import { convertTo16BitColor } from './convertTo16Bit';

export const BLACK_PALETTE = new Array(16).fill(
	convertTo16BitColor([0, 0, 0, 255])
);
