import { Canvas } from 'canvas';
import { convertTo16BitColor } from '../palette/convertTo16Bit';
import { Color24Bit, Palette16Bit } from '../palette/types';
import { SROM_TILE_SIZE_PX } from './constants';
import { SROMTile, SROMTileSourceWithPalette } from './types';

function getIndexedData(source: Canvas, palette: Palette16Bit): number[] {
	const indexed: number[] = [];
	const rawImageData = source
		.getContext('2d')
		.getImageData(0, 0, SROM_TILE_SIZE_PX, SROM_TILE_SIZE_PX).data;

	for (let i = 0; i < rawImageData.length; i += 4) {
		const currentColor24: Color24Bit = Array.from(
			rawImageData.slice(i, i + 4)
		) as Color24Bit;

		const currentColor16 = convertTo16BitColor(currentColor24);

		const index = palette.indexOf(currentColor16);

		if (index === undefined) {
			throw new Error(
				'toSROMTile#getIndexedData: Converting tile to indexed, failed to find a color'
			);
		}

		indexed.push(index);
	}

	return indexed;
}

function convertToSromFormat(indexedData: number[]): number[] {
	const sRomData: number[] = [];

	// first 8 bytes is column A, x=4 and x=5
	for (let y = 0; y < 8; ++y) {
		const leftIndexedValue = indexedData[y * 8 + 4];
		const rightIndexedValue = indexedData[y * 8 + 5];

		// the packed byte has the left pixel (image-wise) in bits 0-3
		// and the right pixel (image-wise) in bits 4-7
		const packedByte =
			(leftIndexedValue & 0xf) | ((rightIndexedValue & 0xf) << 4);
		sRomData[y] = packedByte;
	}

	// second 8 bytes is column B, x=6 and x=7
	for (let y = 0; y < 8; ++y) {
		const leftIndexedValue = indexedData[y * 8 + 6];
		const rightIndexedValue = indexedData[y * 8 + 7];

		// the packed byte has the left pixel (image-wise) in bits 0-3
		// and the right pixel (image-wise) in bits 4-7
		const packedByte =
			(leftIndexedValue & 0xf) | ((rightIndexedValue & 0xf) << 4);
		sRomData[y + 8] = packedByte;
	}

	// third 8 bytes is column C, x=0 and x=1
	for (let y = 0; y < 8; ++y) {
		const leftIndexedValue = indexedData[y * 8 + 0];
		const rightIndexedValue = indexedData[y * 8 + 1];

		// the packed byte has the left pixel (image-wise) in bits 0-3
		// and the right pixel (image-wise) in bits 4-7
		const packedByte =
			(leftIndexedValue & 0xf) | ((rightIndexedValue & 0xf) << 4);
		sRomData[y + 16] = packedByte;
	}

	// final 8 bytes is column D, x=2 and x=3
	for (let y = 0; y < 8; ++y) {
		const leftIndexedValue = indexedData[y * 8 + 2];
		const rightIndexedValue = indexedData[y * 8 + 3];

		// the packed byte has the left pixel (image-wise) in bits 0-3
		// and the right pixel (image-wise) in bits 4-7
		const packedByte =
			(leftIndexedValue & 0xf) | ((rightIndexedValue & 0xf) << 4);
		sRomData[y + 24] = packedByte;
	}

	return sRomData;
}

export function toSROMTile(source: SROMTileSourceWithPalette): SROMTile {
	const indexedData = getIndexedData(source.source, source.palette);

	const sromBinaryData = convertToSromFormat(indexedData);

	return {
		...source,
		sromBinaryData,
	};
}
