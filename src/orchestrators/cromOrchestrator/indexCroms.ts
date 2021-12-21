import { getCROMBinaryData } from '../../api/crom/getCROMBinaryData';
import { CROMTile } from '../../api/crom/types';

function indexCroms(allTiles: CROMTile[]) {
	allTiles.forEach(getCROMBinaryData);
}

export { indexCroms };
