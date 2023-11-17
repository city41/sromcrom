import path from 'path';

import { Palette16Bit } from '../../api/palette/types';
import { CROMTile, ICROMGenerator } from '../../api/crom/types';
import { determinePalettesToEmit } from '../common/determinePalettesToEmit';
import { FileToWrite, JsonInput } from '../../types';
import { indexCroms } from './indexCroms';
import { markCromDupes } from './markCromDupes';
import { positionCroms } from './positionCroms';
import { emitCromBinaries } from './emitCromBinaries';

import { eyecatcher } from '../../generators/eyecatcher';
import { tilesets } from '../../generators/tilesets';
import { cromImages } from '../../generators/cromImages';
import { cromAnimations } from '../../generators/cromAnimations';

// create crom tile generators based on what is in the json file
const generators: Record<string, ICROMGenerator> = {
	eyecatcher,
	tilesets,
	cromImages,
	cromAnimations,
};
const availableCROMGenerators = Object.keys(generators);

function orchestrate(
	rootDir: string,
	input: JsonInput,
	palettesStartingIndex: number
): { palettesToEmit: Palette16Bit[]; filesToWrite: FileToWrite[] } {
	const cromGenerators = availableCROMGenerators
		.filter((generatorKey) => !!input[generatorKey as keyof JsonInput])
		.map((generatorKey) => {
			return generators[generatorKey];
		});

	const cromSourcesResult = cromGenerators.map((generator) => {
		const tiles = generator.getCROMSources(
			rootDir,
			input[generator.jsonKey as keyof JsonInput]
		);

		return {
			tiles,
			generator,
		};
	});

	const allTiles = cromSourcesResult
		.map((input) => input.tiles)
		.flat(3)
		.filter((t) => t !== null) as CROMTile[];

	const finalPalettes = determinePalettesToEmit(
		allTiles,
		palettesStartingIndex
	);

	// convert the 24bit rgb source canvases into actual CROM Tiles with indexed data
	// making sure to keep associating a tile with the generator that initially provided it
	indexCroms(allTiles);

	// mark crom dupes, this mutates in place
	markCromDupes(allTiles);

	// figure out where the croms will go in the binary rom file, taking into account
	// croms that must be at a certain location (primarily the eyecatcher) and auto animations
	// that must be positioned on a multiple of 4 or 8
	// again done with an in place mutation
	positionCroms(rootDir, input, cromSourcesResult);

	const cromBinaries = emitCromBinaries(
		allTiles,
		input.padCROMFilesTo as number | null | undefined
	);

	// TODO: emit more than one pair when croms get too big
	const cromFilesToWrite: FileToWrite[] = [];

	if (cromBinaries.cOddData.length > 0) {
		cromFilesToWrite.push(
			{
				path: path.resolve(rootDir, input.romPathRoot + 'c1.c1'),
				contents: Buffer.from(new Uint8Array(cromBinaries.cOddData)),
			},
			{
				path: path.resolve(rootDir, input.romPathRoot + 'c2.c2'),
				contents: Buffer.from(new Uint8Array(cromBinaries.cEvenData)),
			}
		);
	}

	const otherFilesToWrite = cromSourcesResult.reduce<FileToWrite[]>(
		(building, sromResult) => {
			if (sromResult.generator.getCROMSourceFiles) {
				return building.concat(
					sromResult.generator.getCROMSourceFiles(
						rootDir,
						input[sromResult.generator.jsonKey as keyof JsonInput],
						sromResult.tiles
					)
				);
			} else {
				return building;
			}
		},
		[]
	);

	return {
		palettesToEmit: finalPalettes,
		filesToWrite: cromFilesToWrite.concat(otherFilesToWrite),
	};
}

export { orchestrate };
