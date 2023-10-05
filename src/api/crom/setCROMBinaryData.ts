import { CanvasRenderingContext2D } from 'canvas';
import { convertTo16BitColor } from '../palette/convertTo16Bit';
import { Color24Bit, Palette16Bit } from '../palette/types';
import { CROMTile } from './types';

function separateIntoCorners(
	imgContext: CanvasRenderingContext2D
): Uint8ClampedArray[] {
	return [
		// upper right comes first
		imgContext.getImageData(8, 0, 8, 8).data,
		// then lower right
		imgContext.getImageData(8, 8, 8, 8).data,
		// then upper left
		imgContext.getImageData(0, 0, 8, 8).data,
		// then lower left
		imgContext.getImageData(0, 8, 8, 8).data,
	];
}

function convertToIndexed(
	input: Uint8ClampedArray,
	palette: Palette16Bit
): number[] {
	const indexed: number[] = [];

	for (let i = 0; i < input.length; i += 4) {
		const color24 = Array.from(input.slice(i, i + 4));
		const color16 = convertTo16BitColor(color24 as Color24Bit);

		// small little fix up, did a truly transparent color (alpha is zero)
		// get into the tile? then choose color zero
		const index = color24[3] === 0 ? 0 : palette.indexOf(color16);

		if (index < 0) {
			throw new Error(
				`crom#convertToIndexed: failed to find a matching 16 bit color, 24bit: ${color24.join(
					','
				)}, palette: ${palette.join(',')}`
			);
		}

		indexed.push(index);
	}

	return indexed;
}

function getBytesForIndexedCorner(
	indexedCorner: number[],
	planeOffset: 0 | 2
): number[] {
	// we have a 1d array of indexed colors [0, 1, 2, 15, 0, 1, ...]
	// the indexed values are 4 bit (max 15)
	// we need to grab eight bytes from the corner, and convert it into 2 bytes:
	//  -- first byte, the first bit of the eight pixels (offset by planeOffset)
	//  -- second byte, the second bit of the eight pixels (offset by planeOffset)

	const planeBytes: number[] = [];

	for (let i = 0; i < indexedCorner.length; i += 8) {
		let firstPlaneByte = 0;
		let secondPlaneByte = 0;

		for (let p = 0; p < 8; ++p) {
			const indexedValue = indexedCorner[i + p];
			firstPlaneByte |= ((indexedValue >> planeOffset) & 1) << p;
			secondPlaneByte |= ((indexedValue >> (planeOffset + 1)) & 1) << p;
		}

		planeBytes.push(firstPlaneByte, secondPlaneByte);
	}

	return planeBytes;
}
function getBytesForIndexedCorners(
	indexedCorners: number[][],
	planeOffset: 0 | 2
): number[] {
	return indexedCorners.reduce<number[]>((buildingBytes, corner) => {
		return buildingBytes.concat(getBytesForIndexedCorner(corner, planeOffset));
	}, []);
}

export function setCROMBinaryData(tile: CROMTile): CROMTile {
	if (!tile.palette) {
		throw new Error('toCROMTile: called with a tile that lacks a palette');
	}

	const corners = separateIntoCorners(tile.canvasSource.getContext('2d'));
	const indexedCorners = corners.map((corner) => {
		return convertToIndexed(corner, tile.palette!);
	});

	const cOddData = getBytesForIndexedCorners(indexedCorners, 0);
	const cEvenData = getBytesForIndexedCorners(indexedCorners, 2);

	tile.cromBinaryData = { cOddData, cEvenData };

	return tile;
}
