import { toCROMTile } from '../api/crom/toCROMTile';
import { CROMTile, CROMTileSourceWithPalette } from '../api/crom/types';
import { GeneratorWithCROMTiles, GeneratorWithSources } from './types';

function createIndexedTiles(
	sources: CROMTileSourceWithPalette[][][]
): CROMTile[][][] {
	return sources.map((sourceImage) => {
		return sourceImage.map((sourceRow) => {
			return sourceRow.map(toCROMTile);
		});
	});
}

function indexCroms(
	generatorsWithSources: GeneratorWithSources[]
): GeneratorWithCROMTiles[] {
	return generatorsWithSources.map((generatorWithSources) => {
		return {
			generator: generatorWithSources.generator,
			tiles: createIndexedTiles(generatorWithSources.sourcesWithPalettes),
		};
	});
}

export { indexCroms };
