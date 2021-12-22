import { SROMTileMatrix, ISROMGenerator } from '../../api/srom/types';

export type GeneratorWithSROMTiles = {
	generator: ISROMGenerator;
	tiles: SROMTileMatrix[];
};
