import { toSROMTile } from '../../api/srom/toSROMTile';
import { SROMTile, SROMTileSourceWithPalette } from '../../api/srom/types';
import { GeneratorWithSROMTiles, GeneratorWithSources } from './types';

function createIndexedTiles(
	sources: SROMTileSourceWithPalette[][][]
): SROMTile[][][] {
	return sources.map((sourceImage) => {
		return sourceImage.map((sourceRow) => {
			return sourceRow.map(toSROMTile);
		});
	});
}

function indexSroms(
	generatorsWithSources: GeneratorWithSources[]
): GeneratorWithSROMTiles[] {
	return generatorsWithSources.map((generatorWithSources) => {
		return {
			generator: generatorWithSources.generator,
			tiles: createIndexedTiles(generatorWithSources.sourcesWithPalettes),
		};
	});
}

export { indexSroms };
