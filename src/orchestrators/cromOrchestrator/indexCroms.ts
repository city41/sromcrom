import { setCROMBinaryData } from '../../api/crom/setCROMBinaryData';
import { CROMTile } from '../../api/crom/types';

function indexCroms(allTiles: CROMTile[]) {
	allTiles.forEach(setCROMBinaryData);
}

export { indexCroms };
