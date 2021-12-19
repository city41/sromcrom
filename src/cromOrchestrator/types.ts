import { Palette16Bit } from '../api/palette/types';
import {
	CROMTile,
	CROMTileSource,
	CROMTileSourceWithPalette,
	ICROMGenerator,
} from '../api/crom/types';

export type CROMTileSourceResult = {
	sources: CROMTileSource[][][];
	generator: ICROMGenerator;
};

export type GeneratorWithSources = {
	generator: ICROMGenerator;
	sourcesWithPalettes: CROMTileSourceWithPalette[][][];
};

export type CROMTileSourceWithPalettesResult = {
	generatorResults: GeneratorWithSources[];
	finalPalettes: Palette16Bit[];
};

export type GeneratorWithCROMTiles = {
	generator: ICROMGenerator;
	tiles: CROMTile[][][];
};
