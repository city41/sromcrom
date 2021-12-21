import { CROMTile, ICROMGenerator } from '../../api/crom/types';

export type GeneratorWithCROMTiles = {
	generator: ICROMGenerator;
	tiles: CROMTile[][][];
};
