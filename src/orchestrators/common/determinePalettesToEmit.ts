import { Palette16Bit } from '../../api/palette/types';
import { BLACK16, TRANSPARENT_16BIT_COLOR } from '../../api/palette/colors';
import { get24BitPalette } from '../../api/palette/get24BitPalette';
import { convertTo16BitPalette } from '../../api/palette/convertTo16Bit';
import uniq from 'lodash/uniq';
import { BaseTile } from '../../types';

// a string in the form i-i-i-... where i is a 16 bit packed color
// way too complex and tedious to model as a template literal
type PaletteString = string;

type PaletteMap = Map<Palette16Bit, BaseTile[]>;

function sortPalette(palette: Palette16Bit): Palette16Bit {
	const cloned = [...palette];

	cloned.sort((a, b) => {
		if (a === TRANSPARENT_16BIT_COLOR) {
			return -1;
		}

		if (b === TRANSPARENT_16BIT_COLOR) {
			return 1;
		}

		return a - b;
	});

	return uniq(cloned) as Palette16Bit;
}

function buildPaletteMap(tiles: Array<BaseTile | null>): PaletteMap {
	const intermediateMap = new Map<
		PaletteString,
		{ palette: Palette16Bit; tiles: BaseTile[] }
	>();

	tiles.forEach((tile) => {
		if (!tile) {
			return;
		}

		const palette24 = get24BitPalette(tile.canvasSource);
		const palette16 = sortPalette(convertTo16BitPalette(palette24));

		const paletteString = palette16.join('-');

		if (intermediateMap.has(paletteString)) {
			intermediateMap.get(paletteString)!.tiles.push(tile);
		} else {
			intermediateMap.set(paletteString, {
				palette: palette16,
				tiles: [tile],
			});
		}
	});

	const result: PaletteMap = new Map() as PaletteMap;
	Array.from(intermediateMap.values()).forEach((intermediateValue) => {
		result.set(intermediateValue.palette, intermediateValue.tiles);
	});

	return result;
}

function mergeTwoPalettes(pa: Palette16Bit, pb: Palette16Bit): Palette16Bit {
	const merged = pa.concat(pb);

	const finalMerged = sortPalette(merged as Palette16Bit);

	return finalMerged;
}

function mergePalettes(inputPaletteMap: PaletteMap): PaletteMap {
	const result: PaletteMap = new Map() as PaletteMap;

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
				iPalette = mergedPalette;
			} else {
				++k;
			}
		}

		result.set(iPalette, iSources!);
	}

	return result;
}

function padTo16Values(palette: Palette16Bit): Palette16Bit {
	if (palette.length > 16) {
		throw new Error(
			`determinePalettes#padTo16Values: a palette has more than 16 values: ${palette.length}`
		);
	}

	if (palette.length === 16) {
		return palette;
	}

	const newPalette = [...palette];

	while (newPalette.length < 16) {
		newPalette.push(BLACK16);
	}

	return newPalette as Palette16Bit;
}

function findPalette(tile: BaseTile, paletteMap: PaletteMap): Palette16Bit {
	const entry = Array.from(paletteMap.entries()).find((e) => {
		return e[1].includes(tile);
	});

	return entry![0];
}

function assignPalettes(
	allTiles: Array<BaseTile | null>,
	paletteMap: PaletteMap,
	finalPalettes: Palette16Bit[],
	paletteStartIndex: number
) {
	allTiles.forEach((tile) => {
		if (!tile) {
			return;
		}

		const palette = findPalette(tile, paletteMap);
		const paletteIndex = finalPalettes.indexOf(palette);

		if (paletteIndex < 0) {
			throw new Error(
				'determinePalette#assignPalettesForGenerators: failed to find a palette for a source'
			);
		}

		tile.palette = palette;
		tile.paletteIndex = finalPalettes.indexOf(palette) + paletteStartIndex;
	});
}

function determinePalettesToEmit<TTile extends BaseTile | null>(
	allTiles: TTile[],
	paletteStartIndex: number
): Palette16Bit[] {
	// if a tile is saying don't emit my palette, then it does not need to participate in this.
	// these are primarily eyecatcher tiles, which use system palettes
	const tilesThatWillEmitTheirPalettes = allTiles.filter(
		// if emitPalette is not defined, it defaults to true
		(t) => !t || typeof t.emitPalette === 'undefined' || t.emitPalette
	);

	// convert the 1d array of sources into a palette map,
	// which maps from a 16 bit palette to all of the sources
	// that can use it
	const paletteMap = buildPaletteMap(tilesThatWillEmitTheirPalettes);

	// it is likely palettes can get merged. say two sources each only have
	// 8 colors in them, then we can merge those 8 colors into one palette,
	// and have both sources refer to this merged palette
	const mergedPaletteMap = mergePalettes(paletteMap);

	// the merged palettes are the final palettes that will get loaded into the
	// neo geo, so extract them out into an array, later padding palettes as needed below.
	// this array is ideal for dumping straight into C code
	const finalPalettesNotYetPadded = Array.from(mergedPaletteMap.keys());

	// for each generator, convert their sources into sources-with-palettes
	// later these sources-with-palettes will be used to build the actual CROM data
	assignPalettes(
		allTiles,
		mergedPaletteMap,
		finalPalettesNotYetPadded,
		paletteStartIndex
	);

	return finalPalettesNotYetPadded.map(padTo16Values);
}

export { determinePalettesToEmit };
