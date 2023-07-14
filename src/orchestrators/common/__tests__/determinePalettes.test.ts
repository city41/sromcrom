import { CROMTile } from '../../../api/crom/types';
import {
	BLACK16,
	BLACK24,
	GREEN16,
	GREEN24,
	MAGENTA16,
	RED16,
	RED24,
	WHITE16,
	WHITE24,
} from '../../../api/palette/colors';
import { getTestCanvas } from '../../../testUtil';
import { determinePalettes } from '../determinePalettes';

describe('determinePalettes', function () {
	it('should determine the palette for a single source', function () {
		const tile: CROMTile = {
			canvasSource: getTestCanvas(BLACK24, RED24),
		};

		const result = determinePalettes([tile], 0);

		const expectedSourcePalette = [MAGENTA16, BLACK16, RED16];

		const expectedFinalPalette = expectedSourcePalette.concat(
			new Array(13).fill(BLACK16)
		);

		expect(result).toEqual([expectedFinalPalette]);
		expect(tile.palette).toEqual(expectedSourcePalette);
		expect(tile.paletteIndex).toEqual(0);
	});

	it('should offset the palette indices by paletteStartIndex', function () {
		const tile: CROMTile = {
			canvasSource: getTestCanvas(BLACK24, RED24),
		};

		determinePalettes([tile], 33);

		expect(tile.paletteIndex).toEqual(33);
	});

	it('should merge palettes whenever possible', function () {
		const tile1: CROMTile = {
			canvasSource: getTestCanvas(BLACK24, RED24),
		};
		const tile2: CROMTile = {
			canvasSource: getTestCanvas(BLACK24, WHITE24, RED24),
		};
		const tile3: CROMTile = {
			canvasSource: getTestCanvas(BLACK24, RED24, GREEN24),
		};

		const result = determinePalettes([tile1, tile2, tile3], 33);

		const expectedPalette = [MAGENTA16, GREEN16, WHITE16, BLACK16, RED16];

		for (let i = 0; i < expectedPalette.length; ++i) {
			expect(result[0][i]).toEqual(expectedPalette[i]);
		}

		expect(result[0].slice(expectedPalette.length)).toEqual(
			new Array(16 - expectedPalette.length).fill(BLACK16)
		);
	});
});
