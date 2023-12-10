import { Canvas } from 'canvas';
import {
	convertTo16BitColor,
	convertTo16BitColorIgnoreDarkBit,
} from '../palette/convertTo16Bit';
import { Color24Bit, Palette16Bit } from '../palette/types';
import { SROM_TILE_SIZE_PX } from './constants';
import { SROMTile } from './types';

function getIndexedData(
	source: Canvas,
	palette: Palette16Bit,
	ignoreDarkBit: boolean
): number[] {
	const convertColor = ignoreDarkBit
		? convertTo16BitColorIgnoreDarkBit
		: convertTo16BitColor;

	const indexed: number[] = [];
	const rawImageData = source
		.getContext('2d')
		.getImageData(0, 0, SROM_TILE_SIZE_PX, SROM_TILE_SIZE_PX).data;

	for (let i = 0; i < rawImageData.length; i += 4) {
		const currentColor24: Color24Bit = Array.from(
			rawImageData.slice(i, i + 4)
		) as Color24Bit;

		let index;
		if (currentColor24[3] !== 255) {
			// any transparent color gets set to zero, which is transparent in neo geo palettes
			index = 0;
		} else {
			const currentColor16 = convertColor(currentColor24);
			index = palette.indexOf(currentColor16);
		}

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

export function setSROMBinaryData(tile: SROMTile): SROMTile {
	if (!tile.palette) {
		throw new Error(
			'setSROMBinaryData called with a tile that lacks a palette'
		);
	}

	const indexedData = getIndexedData(
		tile.canvasSource,
		tile.palette,
		tile.paletteIgnoresDarkBit ?? false
	);
	tile.sromBinaryData = convertToSromFormat(indexedData);

	return tile;
}
