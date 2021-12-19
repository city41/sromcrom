import { createCanvas } from 'canvas';
import {
	FULL_SROM_SIZE_BYTES,
	SROM_TILE_SIZE_BYTES,
} from '../../api/srom/constants';
import { SROMTile } from '../../api/srom/types';
import { emitSromBinary } from '../emitSromBinary';

describe('emitSromBinary', function () {
	it('should pad the srom data', function () {
		const tiles: SROMTile[] = [
			{
				palette: [0],
				paletteIndex: 0,
				source: createCanvas(1, 1),
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
				source: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(0),
				sromIndex: 0,
			},
			{
				palette: [0],
				paletteIndex: 0,
				source: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(0),
			},
			{
				palette: [0],
				paletteIndex: 0,
				source: createCanvas(1, 1),
				sromBinaryData: new Array(SROM_TILE_SIZE_BYTES).fill(1),
				sromIndex: 1,
			},
		];

		const sromData = emitSromBinary(tiles);
		const firstTwoTiles = sromData.slice(0, SROM_TILE_SIZE_BYTES * 2);

		expect(firstTwoTiles).toEqual(
			tiles[0].sromBinaryData.concat(tiles[2].sromBinaryData)
		);
	});
});
