import { createCanvas } from 'canvas';
import {
	FULL_SROM_SIZE_BYTES,
	SROM_TILE_SIZE_BYTES,
} from '../../../api/srom/constants';
import { SROMTile } from '../../../api/srom/types';
import { emitSromBinary } from '../emitSromBinary';

describe('emitSromBinary', function () {
	it('should pad the srom data', function () {
		const tiles: SROMTile[] = [
			{
				palette: [0],
				paletteIndex: 0,
				canvasSource: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(0),
				sromIndex: 0,
			},
		];

		const sromData = emitSromBinary(tiles);
		expect(sromData.length).toBe(FULL_SROM_SIZE_BYTES);
	});

	it('should skip any tiles that are not positioned', function () {
		const tiles: SROMTile[] = [
			{
				palette: [0],
				paletteIndex: 0,
				canvasSource: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(0),
				sromIndex: 0,
			},
			{
				palette: [0],
				paletteIndex: 0,
				canvasSource: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(0),
			},
			{
				palette: [0],
				paletteIndex: 0,
				canvasSource: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(1),
				sromIndex: 1,
			},
		];

		const sromData = emitSromBinary(tiles);
		const firstTwoTiles = sromData.slice(0, SROM_TILE_SIZE_BYTES * 2);

		expect(firstTwoTiles).toEqual(
			tiles[0].sromBinaryData!.concat(tiles[2].sromBinaryData!)
		);
	});

	it('should emit the highest priority tile when two want the same index', function () {
		const tiles: SROMTile[] = [
			{
				palette: [0],
				paletteIndex: 0,
				canvasSource: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(4),
				sromIndex: 0,
			},
			{
				palette: [0],
				paletteIndex: 0,
				canvasSource: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(1),
				sromIndex: 0,
				priority: 1,
			},
		];

		const sromData = emitSromBinary(tiles);
		const firstTile = sromData.slice(0, SROM_TILE_SIZE_BYTES);

		// the second tile should be in index one, as its priority is higher
		expect(firstTile).toEqual(tiles[1].sromBinaryData);

		// the first tile should not have been emitted at all, because the index
		// it wanted to go into was taken by tile 2
		expect(sromData.indexOf(4)).toBe(-1);
	});
});
