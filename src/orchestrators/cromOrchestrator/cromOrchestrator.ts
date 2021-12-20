import path from 'path';

import { Palette16Bit } from '../../api/palette/types';
import { CROMTile, ICROMGenerator } from '../../api/crom/types';
import { eyecatcher } from '../../generators/eyecatcher';
import { determinePalettes } from '../common/determinePalettes';
import { CROMTileSourceResult } from './types';
import { FileToWrite, Json } from '../../types';
import { indexCroms } from './indexCroms';
import { markCromDupes } from './markCromDupes';
import { positionCroms } from './positionCroms';
import { emitCromBinaries } from './emitCromBinaries';

// create crom tile generators based on what is in the json file
const generators: Record<string, ICROMGenerator> = {
	eyecatcher,
};
const availableCROMGenerators = Object.keys(generators);

function orchestrate(
	rootDir: string,
	resourceJson: Json,
	palettesStartingIndex: number
): { palettes: Palette16Bit[]; filesToWrite: FileToWrite[] } {
	const cromGenerators: ICROMGenerator[] = availableCROMGenerators.reduce<
		ICROMGenerator[]
	>((building, generatorKey) => {
		if (resourceJson[generatorKey]) {
			return building.concat(generators[generatorKey]);
		} else {
			return building;
		}
	}, []);

	const cromSourcesResult = cromGenerators.reduce<CROMTileSourceResult[]>(
		(building, generator) => {
			const sources = generator.getCROMSources(
				rootDir,
				resourceJson[generator.jsonKey] as Record<string, unknown>
			);

			return building.concat({
				sources,
				generator,
			});
		},
		[]
	);

	// TODO: nothing below handles child auto animation frames yet

	const cromSourcesWithPalettes = determinePalettes(
		cromSourcesResult,
		palettesStartingIndex
	);

	// convert the 24bit rgb source canvases into actual CROM Tiles with indexed data
	// making sure to keep associating a tile with the generator that initially provided it
	const indexedCromResults = indexCroms(
		cromSourcesWithPalettes.generatorResults
	);

	const allTiles = indexedCromResults.reduce<CROMTile[]>((building, input) => {
		return building.concat(input.tiles.flat(2));
	}, []);

	// mark crom dupes, this mutates in place
	markCromDupes(allTiles);

	// figure out where the croms will go in the binary rom file, taking into account
	// croms that must be at a certain location (primarily the eyecatcher) and auto animations
	// that must be positioned on a multiple of 4 or 8
	// again done with an in place mutation
	positionCroms(rootDir, resourceJson, indexedCromResults);

	const cromBinaries = emitCromBinaries(allTiles);

	// TODO: emit more than one pair when croms get too big
	const cromFilesToWrite: FileToWrite[] = [
		{
			path: path.resolve(rootDir, resourceJson.romPathRoot + 'c1.c1'),
			contents: Buffer.from(new Uint8Array(cromBinaries.cOddData)),
		},
		{
			path: path.resolve(rootDir, resourceJson.romPathRoot + 'c2.c2'),
			contents: Buffer.from(new Uint8Array(cromBinaries.cEvenData)),
		},
	];

	return {
		palettes: cromSourcesWithPalettes.finalPalettes,
		filesToWrite: cromFilesToWrite,
	};
}

export { orchestrate };
