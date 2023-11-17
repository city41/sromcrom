import path from 'path';

import { Palette16Bit } from '../../api/palette/types';
import { ISROMGenerator, SROMTile } from '../../api/srom/types';
import { determinePalettesToEmit } from '../common/determinePalettesToEmit';
import { FileToWrite, JsonInput } from '../../types';
import { indexSroms } from './indexSroms';
import { markSromDupes } from './markSromDupes';
import { positionSroms } from './positionSroms';
import { emitSromBinary } from './emitSromBinary';
import { eyecatcher } from '../../generators/eyecatcher';
import { sromImages } from '../../generators/sromImages';
import { sromFFBlankGenerator } from './sromFFBlankGenerator';

const generators: Record<string, ISROMGenerator> = {
	eyecatcher,
	sromImages,
};
const availableSROMGenerators = Object.keys(generators);

function orchestrate(
	rootDir: string,
	input: JsonInput,
	palettesStartingIndex: number
): { palettesToEmit: Palette16Bit[]; filesToWrite: FileToWrite[] } {
	const sromGenerators = availableSROMGenerators
		.filter((generatorKey) => !!input[generatorKey as keyof JsonInput])
		.map((generatorKey) => {
			return generators[generatorKey];
		});

	// if the proGearSpec image was not specified, then we add this generator
	// which will ensure that the tile at 0xff is blank. If the image is specified,
	// then that image needs to have a blank tile at that spot, and if it doesn't,
	// the user will be warned
	if (!input.eyecatcher?.proGearSpecImageFile) {
		sromGenerators.push(sromFFBlankGenerator);
	}

	const sromSourcesResult = sromGenerators.map((generator) => {
		const tiles = generator.getSROMSources(
			rootDir,
			input[generator.jsonKey as keyof JsonInput]
		);

		return {
			tiles,
			generator,
		};
	});

	const allTiles = sromSourcesResult
		.map((input) => input.tiles)
		// the tiles are a collection of collection of columns, so flatten up to 3
		.flat(3)
		.filter((t) => t !== null) as SROMTile[];

	const finalPalettes = determinePalettesToEmit(
		allTiles,
		palettesStartingIndex
	);

	// convert the 24bit rgb source canvases into actual SROM Tiles with indexed data
	// making sure to keep associating a tile with the generator that initially provided it
	indexSroms(allTiles);

	// mark srom dupes, again keeping tiles associated with their generator
	// this is done by mutating the sroms in place, so no return needed
	markSromDupes(allTiles);

	// figure out where the sroms will go in the binary rom file, taking into account
	// sroms that must be at a certain location (primarily the eyecatcher) and auto animations
	// that must be positioned on a multiple of 4 or 8
	// again done with an in place mutation
	positionSroms(rootDir, input, sromSourcesResult);

	const sromBinaryData = emitSromBinary(allTiles);
	const sromFileToWrite: FileToWrite = {
		path: path.resolve(rootDir, input.romPathRoot + 's1.s1'),
		contents: Buffer.from(new Uint8Array(sromBinaryData)),
	};

	const otherFilesToWrite = sromSourcesResult.reduce<FileToWrite[]>(
		(building, sromResult) => {
			if (sromResult.generator.getSROMSourceFiles) {
				return building.concat(
					sromResult.generator.getSROMSourceFiles(
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
		filesToWrite: [sromFileToWrite].concat(otherFilesToWrite),
	};
}

export { orchestrate };
