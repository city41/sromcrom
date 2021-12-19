import { createCanvas } from 'canvas';
import { CROM_TILE_HALF_SIZE_BYTES } from '../../api/crom/constants';
import { CROMTile } from '../../api/crom/types';
import { emitCromBinaries } from '../emitCromBinaries';

describe('emitSromBinary', function () {
	it('should not pad the crom data', function () {
		const tiles: CROMTile[] = [
			{
				palette: [0],
				paletteIndex: 0,
				source: createCanvas(1, 1),
				cromBinaryData: {
					cOddData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(0),
					cEvenData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(0),
				},
				cromIndex: 0,
			},
		];

		const cromData = emitCromBinaries(tiles);
		expect(cromData.cEvenData.length).toBe(CROM_TILE_HALF_SIZE_BYTES);
		expect(cromData.cOddData.length).toBe(CROM_TILE_HALF_SIZE_BYTES);
	});

	it('should skip any tiles that are not positioned', function () {
		const tiles: CROMTile[] = [
			{
				palette: [0],
				paletteIndex: 0,
				source: createCanvas(1, 1),
				cromBinaryData: {
					cOddData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(0),
					cEvenData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(0),
				},
				cromIndex: 0,
			},
			{
				palette: [0],
				paletteIndex: 0,
				source: createCanvas(1, 1),
				cromBinaryData: {
					cOddData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(0),
					cEvenData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(0),
				},
			},
			{
				palette: [0],
				paletteIndex: 0,
				source: createCanvas(1, 1),
				cromBinaryData: {
					cOddData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(1),
					cEvenData: new Array(CROM_TILE_HALF_SIZE_BYTES).fill(1),
				},
				cromIndex: 1,
			},
		];

		const cromData = emitCromBinaries(tiles);

		expect(cromData.cEvenData).toEqual(
			tiles[0].cromBinaryData.cEvenData.concat(
				tiles[2].cromBinaryData.cEvenData
			)
		);

		expect(cromData.cOddData).toEqual(
			tiles[0].cromBinaryData.cOddData.concat(tiles[2].cromBinaryData.cOddData)
		);
	});
});
