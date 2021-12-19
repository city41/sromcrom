import { CROMTile } from '../api/crom/types';
import isEqual from 'lodash/isEqual';
import { markDupes } from '../api/tile/markDupes';

function markCromDupes(tiles: CROMTile[]): void {
	markDupes(tiles, (a, b) => isEqual(a.cromBinaryData, b.cromBinaryData));
}

export { markCromDupes };
