import { Canvas } from 'canvas';
import { Palette16Bit } from '../../api/palette/types';
import { TRANSPARENT_16BIT_COLOR } from '../../api/palette/transparentColor';
import { get24BitPalette } from '../../api/palette/get24BitPalette';
import { convertTo16BitPalette } from '../../api/palette/convertTo16Bit';
import uniq from 'lodash/uniq';

// all of the generics in here are so this file can support either crom's or srom's
// T is either a CROM source or an SROM source, of which we just need the canvas that is
// the tile in modern format (such as png)
//
// G is the generator type, it's a black box throughout this file

type BaseTileSource = {
	source: Canvas;
};

type BaseResult<T extends BaseTileSource, G> = {
	sources: T[][][];
	generator: G;
};

type BaseTileSourceResult<T extends BaseTileSource, G> = {
	sources: T[][][];
	generator: G;
};

type BaseTileSourceWithPalette<T extends BaseTileSource> = T & {
	palette: Palette16Bit;
	paletteIndex: number;
};

type BaseGeneratorWithSources<T extends BaseTileSource, G> = {
	generator: G;
	sourcesWithPalettes: BaseTileSourceWithPalette<T>[][][];
};

type BaseTileSourceWithPalettesResult<T extends BaseTileSource, G> = {
	generatorResults: BaseGeneratorWithSources<T, G>[];
	finalPalettes: Palette16Bit[];
};

// a string in the form i-i-i-... where i is a 16 bit packed color
// way too complex and tedious to model as a template literal
type PaletteString = string;

type PaletteMap<T> = Map<Palette16Bit, T[]>;

function sortPalette(r16: Palette16Bit): Palette16Bit {
	const sortedArray = [...r16];

	sortedArray.sort((a, b) => {
		if (a === TRANSPARENT_16BIT_COLOR) {
			return -1;
		}

		if (b === TRANSPARENT_16BIT_COLOR) {
			return 1;
		}

		return a - b;
	});

	return uniq(sortedArray) as Palette16Bit;
}

function buildPaletteMap<T extends BaseTileSource>(
	sources: T[]
): PaletteMap<T> {
	const intermediateMap = new Map<
		PaletteString,
		{ palette: Palette16Bit; sources: T[] }
	>();

	sources.forEach((source) => {
		const palette24 = get24BitPalette(source.source);
		const palette16 = sortPalette(convertTo16BitPalette(palette24));

		const paletteString = palette16.join('-');

		if (intermediateMap.has(paletteString)) {
			intermediateMap.get(paletteString)!.sources.push(source);
		} else {
			intermediateMap.set(paletteString, {
				palette: palette16,
				sources: [source],
			});
		}
	});

	const result: PaletteMap<T> = new Map() as PaletteMap<T>;
	Array.from(intermediateMap.values()).forEach((intermediateValue) => {
		result.set(intermediateValue.palette, intermediateValue.sources);
	});

	return result;
}

function mergeTwoPalettes(pa: Palette16Bit, pb: Palette16Bit): Palette16Bit {
	const merged = pa.concat(pb);
	return sortPalette(merged as Palette16Bit);
}

function mergePalettes<T extends BaseTileSource>(
	inputPaletteMap: PaletteMap<T>
): PaletteMap<T> {
	const result: PaletteMap<T> = new Map() as PaletteMap<T>;

	const allPalettes = Array.from(inputPaletteMap.keys());

	for (let i = 0; i < allPalettes.length; ++i) {
		let iPalette = allPalettes[i];
		let iSources = inputPaletteMap.get(iPalette);

		for (let k = i + 1; k < allPalettes.length; ) {
			const kPalette = allPalettes[k];

			const mergedPalette = mergeTwoPalettes(iPalette, kPalette);

			if (mergedPalette.length < 17) {
				const kSources = inputPaletteMap.get(kPalette);

				// since k got merged into i, remove it from allPalettes
				allPalettes.splice(k, 1);
				iSources = iSources!.concat(kSources!);
			} else {
				++k;
			}
		}

		result.set(iPalette, iSources!);
	}

	return result;
}

function padTo16Values(palette: Palette16Bit): Palette16Bit {
	if (palette.length === 16) {
		return palette;
	}

	const newPalette = [...palette];

	while (newPalette.length < 16) {
		newPalette.push(0);
	}

	return newPalette as Palette16Bit;
}

function findPalette<T extends BaseTileSource>(
	source: T,
	paletteMap: PaletteMap<T>
): Palette16Bit {
	const entry = Array.from(paletteMap.entries()).find((e) => {
		return e[1].includes(source);
	});

	return entry![0];
}

function assignPalettesForGenerators<T extends BaseTileSource, G>(
	cromSourceResults: BaseResult<T, G>[],
	allCROMSources: T[],
	paletteMap: PaletteMap<T>,
	finalPalettes: Palette16Bit[]
): Array<{
	sourcesWithPalettes: BaseTileSourceWithPalette<T>[][][];
	generator: G;
}> {
	const sourceToSourceWithPalette = new Map<T, BaseTileSourceWithPalette<T>>();

	allCROMSources.forEach((source) => {
		const palette = findPalette(source, paletteMap);
		const sourceWithPalette = {
			...source,
			palette,
			paletteIndex: finalPalettes.indexOf(palette),
		};
		sourceToSourceWithPalette.set(source, sourceWithPalette);
	});

	return cromSourceResults.map((cromSourceResult) => {
		const sourcesWithPalettes = cromSourceResult.sources.map((sourceImage) => {
			return sourceImage.map((sourceRow) => {
				return sourceRow.map((source) => {
					return sourceToSourceWithPalette.get(source)!;
				});
			});
		});

		return {
			generator: cromSourceResult.generator,
			sourcesWithPalettes,
		};
	});
}

function determinePalettes<T extends BaseTileSource, G>(
	sourceResults: BaseTileSourceResult<T, G>[]
): BaseTileSourceWithPalettesResult<T, G> {
	// we need to associate a CROMTileSource to its generator, so first build
	// a map that lets us do that
	const sourceToResult = new Map<T, BaseTileSourceResult<T, G>>();

	// extract all crom sources out into a single dimension array, which is the input
	// for figuring out our palettes
	const allSources: T[] = [];

	sourceResults.forEach((sourceResult) => {
		const sources = sourceResult.sources.flat(2);
		sources.forEach((source) => {
			sourceToResult.set(source, sourceResult);
		});

		allSources.push(...sources);
	});

	// convert the 1d array of sources into a palette map,
	// which maps from a 16 bit palette to all of the sources
	// that can use it
	const paletteMap = buildPaletteMap(allSources);

	// it is likely palettes can get merged. say two sources each only have
	// 8 colors in them, then we can merge those 8 colors into one palette,
	// and have both sources refer to this merged palette
	const mergedPaletteMap = mergePalettes(paletteMap);

	// the merged palettes are the final palettes that will get loaded into the
	// neo geo, so extract them out into an array, padding palettes as needed.
	// this array is ideal for dumping straight into C code
	const finalPalettes = Array.from(mergedPaletteMap.keys()).map(padTo16Values);

	// for each generator, convert their sources into sources-with-palettes
	// later these sources-with-palettes will be used to build the actual CROM data
	const generatorResults = assignPalettesForGenerators(
		sourceResults,
		allSources,
		mergedPaletteMap,
		finalPalettes
	);

	return {
		generatorResults,
		finalPalettes,
	};
}

export { determinePalettes };
