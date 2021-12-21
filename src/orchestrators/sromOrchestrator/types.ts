import { Palette16Bit } from '../../api/palette/types';
import { SROMTile, ISROMGenerator } from '../../api/srom/types';

export type GeneratorWithSROMTiles = {
	generator: ISROMGenerator;
	tiles: SROMTile[][][];
};
