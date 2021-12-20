import {
	BLACK16,
	BLACK24,
	GREEN16,
	GREEN24,
	MAGENTA16,
	MAGENTA24,
	RED16,
	RED24,
	WHITE16,
	WHITE24,
} from '../../../api/palette/colors';
import { getTestCanvas } from '../../../testUtil';
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
			new Array(13).fill(BLACK16)
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

	it.only('should merge palettes whenever possible', function () {
		const source1 = {
			source: getTestCanvas(BLACK24, RED24),
		};
		const source2 = {
			source: getTestCanvas(BLACK24, WHITE24, RED24),
		};
		const source3 = {
			source: getTestCanvas(BLACK24, RED24, GREEN24),
		};

		const sourceInputs = [
			{
				sources: [[[source1, source2]]],
				generator: {},
			},
			{
				sources: [[[source3]]],
				generator: {},
			},
		];

		const result = determinePalettes(sourceInputs, 33);

		const expectedSourcePalette = [MAGENTA16, GREEN16, WHITE16, BLACK16, RED16];
		const actualPalette =
			result.generatorResults[0].sourcesWithPalettes[0][0][0].palette;

		expect(actualPalette).toEqual(expectedSourcePalette);
	});
});
