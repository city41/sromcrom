import { CROMTile } from '../../api/crom/types';
import { markDupes } from '../../api/tile/markDupes';
import isEqual from 'lodash/isEqual';

function markCromDupes(tiles: CROMTile[]): void {
	markDupes(tiles, (a, b) => isEqual(a.cromBinaryData, b.cromBinaryData));
}

export { markCromDupes };
