import { CROMTile } from '../../api/crom/types';
import { markDupes } from '../../api/tile/markDupes';
import isEqual from 'lodash/isEqual';

function markCromDupes(tiles: CROMTile[]): void {
	markDupes(tiles, (a, b) => {
		return (
			isEqual(a.cromBinaryData, b.cromBinaryData) &&
			// anything involved in an auto animation should be left alone
			!a.childAnimationFrames &&
			!a.childOf &&
			!b.childAnimationFrames &&
			!b.childOf
		);
	});
}

export { markCromDupes };
