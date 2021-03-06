import path from 'path';

import { Palette16Bit } from '../../api/palette/types';
import { ISROMGenerator, SROMTile } from '../../api/srom/types';
import { determinePalettes } from '../common/determinePalettes';
import { FileToWrite, Json } from '../../types';
import { indexSroms } from './indexSroms';
import { markSromDupes } from './markSromDupes';
import { positionSroms } from './positionSroms';
import { emitSromBinary } from './emitSromBinary';
import { eyecatcher } from '../../generators/eyecatcher';
import { sromImages } from '../../generators/sromImages';
import { ffBlankGenerator } from './ffBlankGenerator';
import { GeneratorWithSROMTiles } from './types';

const generators: Record<string, ISROMGenerator> = {
	eyecatcher,
	sromImages,
};
const availableSROMGenerators = Object.keys(generators);

function orchestrate(
	rootDir: string,
	resourceJson: Json,
	palettesStartingIndex: number
): { palettes: Palette16Bit[]; filesToWrite: FileToWrite[] } {
	const sromGenerators = availableSROMGenerators
		.filter((generatorKey) => !!resourceJson[generatorKey])
		.map((generatorKey) => {
			return generators[generatorKey];
		});

	// if the proGearSpec image was not specified, then we add this generator
	// who will ensure that the tile at 0xff is blank. If the image is specified,
	// then that image needs to have a blank tile at that spot, and if it doesn't,
	// the user will be warned
	if (!(resourceJson as any).eyecatcher?.proGearSpecImageFile) {
		sromGenerators.push(ffBlankGenerator);
	}

	const sromSourcesResult = sromGenerators.map((generator) => {
		const tiles = generator.getSROMSources(
			rootDir,
			resourceJson[generator.jsonKey] as Json
		);

		return {
			tiles,
			generator,
		};
	});

	const allTiles = sromSourcesResult
		.map((input) => input.tiles)
		.flat(3)
		.filter((t) => t !== null) as SROMTile[];

	const finalPalettes = determinePalettes(allTiles, palettesStartingIndex);

	// convert the 24bit rgb source canvases into actual SROM Tiles with indexed data
	// making sure to keep associating a tile with the generator that initially provided it
	indexSroms(allTiles);

	// mark crom dupes, again keeping tiles associated with their generator
	// this is done by mutating the croms in place, so no return needed
	markSromDupes(allTiles);

	// figure out where the croms will go in the binary rom file, taking into account
	// croms that must be at a certain location (primarily the eyecatcher) and auto animations
	// that must be positioned on a multiple of 4 or 8
	// again done with an in place mutation
	positionSroms(rootDir, resourceJson, sromSourcesResult);

	const sromBinaryData = emitSromBinary(allTiles);
	const sromFileToWrite: FileToWrite = {
		path: path.resolve(rootDir, resourceJson.romPathRoot + 's1.s1'),
		contents: Buffer.from(new Uint8Array(sromBinaryData)),
	};

	const otherFilesToWrite = sromSourcesResult.reduce<FileToWrite[]>(
		(building, sromResult) => {
			if (sromResult.generator.getSROMSourceFiles) {
				return building.concat(
					sromResult.generator.getSROMSourceFiles(
						rootDir,
						resourceJson[sromResult.generator.jsonKey] as Json,
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
		palettes: finalPalettes,
		filesToWrite: [sromFileToWrite].concat(otherFilesToWrite),
	};
}

export { orchestrate };
