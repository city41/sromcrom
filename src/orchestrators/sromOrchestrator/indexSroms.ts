import { getSROMBinaryData } from '../../api/srom/getSROMBinaryData';
import { SROMTile } from '../../api/srom/types';

function indexSroms(allTiles: SROMTile[]) {
	allTiles.forEach(getSROMBinaryData);
}

export { indexSroms };
