import { SROMTile } from '../api/srom/types';
import isEqual from 'lodash/isEqual';
import { markDupes } from '../api/tile/markDupes';

function markSromDupes(tiles: SROMTile[]): void {
	markDupes(tiles, (a, b) => isEqual(a.sromBinaryData, b.sromBinaryData));
}

export { markSromDupes };
