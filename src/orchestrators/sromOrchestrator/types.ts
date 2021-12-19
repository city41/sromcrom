import { Palette16Bit } from '../../api/palette/types';
import {
	SROMTile,
	SROMTileSource,
	SROMTileSourceWithPalette,
	ISROMGenerator,
} from '../../api/srom/types';

export type SROMTileSourceResult = {
	sources: SROMTileSource[][][];
	generator: ISROMGenerator;
};

export type GeneratorWithSources = {
	generator: ISROMGenerator;
	sourcesWithPalettes: SROMTileSourceWithPalette[][][];
};

export type SROMTileSourceWithPalettesResult = {
	generatorResults: GeneratorWithSources[];
	finalPalettes: Palette16Bit[];
};

export type GeneratorWithSROMTiles = {
	generator: ISROMGenerator;
	tiles: SROMTile[][][];
};
