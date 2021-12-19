import path from 'path';

import { Palette16Bit } from '../api/palette/types';
import { ISROMGenerator, SROMTile } from '../api/srom/types';
import { eyecatcher } from '../eyecatcher';
import { determinePalettes } from '../orchestratorCommon/determinePalettes';
import { SROMTileSourceResult } from './types';
import { FileToWrite } from '../types';
import { indexSroms } from './indexSroms';
import { markSromDupes } from './markSromDupes';
import { positionSroms } from './positionSroms';
import { emitSromBinary } from './emitSromBinary';

const generators: Record<string, ISROMGenerator> = {
	eyecatcher,
};
const availableSROMGenerators = Object.keys(generators);

function orchestrate(
	rootDir: string,
	resourceJson: any
): { palettes: Palette16Bit[]; filesToWrite: FileToWrite[] } {
	const sromGenerators: ISROMGenerator[] = availableSROMGenerators.reduce<
		ISROMGenerator[]
	>((building, generatorKey) => {
		if (resourceJson[generatorKey]) {
			return building.concat(generators[generatorKey]);
		} else {
			return building;
		}
	}, []);

	const sromSourcesResult = sromGenerators.reduce<SROMTileSourceResult[]>(
		(building, generator) => {
			const sources = generator.getSROMSources(
				process.cwd(),
				resourceJson[generator.jsonKey] as Record<string, unknown>
			);

			return building.concat({
				sources,
				generator,
			});
		},
		[]
	);

	const sromSourcesWithPalettes = determinePalettes(sromSourcesResult);

	// convert the 24bit rgb source canvases into actual SROM Tiles with indexed data
	// making sure to keep associating a tile with the generator that initially provided it
	const indexedSromResults = indexSroms(
		sromSourcesWithPalettes.generatorResults
	);

	const allTiles = indexedSromResults.reduce<SROMTile[]>((building, input) => {
		return building.concat(input.tiles.flat(2));
	}, []);

	// mark crom dupes, again keeping tiles associated with their generator
	// this is done by mutating the croms in place, so no return needed
	markSromDupes(allTiles);

	// figure out where the croms will go in the binary rom file, taking into account
	// croms that must be at a certain location (primarily the eyecatcher) and auto animations
	// that must be positioned on a multiple of 4 or 8
	// again done with an in place mutation
	positionSroms(indexedSromResults);

	const sromBinaryData = emitSromBinary(allTiles);
	const sromFileToWrite: FileToWrite = {
		path: path.resolve(rootDir, resourceJson.romPathRoot + 's1.s1'),
		contents: Buffer.from(new Uint8Array(sromBinaryData)),
	};

	return {
		palettes: sromSourcesWithPalettes.finalPalettes,
		filesToWrite: [sromFileToWrite],
	};
}

export { orchestrate };
