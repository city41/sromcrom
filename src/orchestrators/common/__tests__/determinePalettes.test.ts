import {
	getTestCanvas,
	BLACK24,
	RED24,
	MAGENTA16,
	BLACK16,
	RED16,
} from '../../../testUtil';
import { determinePalettes } from '../determinePalettes';

describe('determinePalettes', function () {
	const source = {
		source: getTestCanvas(BLACK24, RED24),
	};
	const sourceInputs = [
		{
			sources: [[[source]]],
			generator: {},
		},
	];

	it('should determine the palette for a single source', function () {
		const result = determinePalettes(sourceInputs, 0);

		const expectedSourcePalette = [MAGENTA16, BLACK16, RED16];

		const expectedFinalPalette = expectedSourcePalette.concat(
			new Array(13).fill(0)
		);

		expect(result.finalPalettes).toEqual([expectedFinalPalette]);
		expect(
			result.generatorResults[0].sourcesWithPalettes[0][0][0].palette
		).toEqual(expectedSourcePalette);
		expect(
			result.generatorResults[0].sourcesWithPalettes[0][0][0].paletteIndex
		).toEqual(0);
	});

	it('should offset the palette indices by paletteStartIndex', function () {
		const result = determinePalettes(sourceInputs, 33);

		expect(
			result.generatorResults[0].sourcesWithPalettes[0][0][0].paletteIndex
		).toEqual(33);
	});
});
