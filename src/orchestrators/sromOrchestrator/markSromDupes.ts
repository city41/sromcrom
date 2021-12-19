import { SROMTile } from '../../api/srom/types';
import { markDupes } from '../../api/tile/markDupes';
import isEqual from 'lodash/isEqual';

function markSromDupes(tiles: SROMTile[]): void {
	markDupes(tiles, (a, b) => isEqual(a.sromBinaryData, b.sromBinaryData));
}

export { markSromDupes };
