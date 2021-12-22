import { setSROMBinaryData } from '../../api/srom/setSROMBinaryData';
import { SROMTile } from '../../api/srom/types';

function indexSroms(allTiles: SROMTile[]) {
	allTiles.forEach(setSROMBinaryData);
}

export { indexSroms };
