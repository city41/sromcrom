import {
	FULL_SROM_SIZE_BYTES,
	SROM_TILE_SIZE_BYTES,
} from '../../api/srom/constants';
import { SROMTile } from '../../api/srom/types';

function sortBySromIndex(a: SROMTile, b: SROMTile): number {
	if (a.sromIndex === undefined && b.sromIndex === undefined) {
		return 0;
	}

	if (a.sromIndex !== undefined && b.sromIndex === undefined) {
		return -1;
	}

	if (b.sromIndex !== undefined && a.sromIndex === undefined) {
		return 1;
	}

	return a.sromIndex! - b.sromIndex!;
}

function emitSromBinary(sourceTiles: SROMTile[]): number[] {
	const tilesToEmit = sourceTiles.filter((t, _i, a) => {
		if (t.duplicateOf || typeof t.sromIndex !== 'number') {
			return false;
		}

		const allTilesWithSameIndex = a.filter(
			(t2) => t2.sromIndex === t.sromIndex
		);

		// only one tile has this index, we are good to go
		if (allTilesWithSameIndex.length === 1) {
			return true;
		}

		// otherwise, only emit this time if it has the highest priority
		// two tiles could have the same priority, and in that case both will get into
		// tilesToEmit. In that case, the later one in the array ultimately wins
		const priorities = allTilesWithSameIndex.map((t2) => t2.priority ?? 0);
		const maxPriority = Math.max(...priorities);

		return (t.priority ?? 0) === maxPriority;
	});

	tilesToEmit.sort(sortBySromIndex);

	const sData: number[] = new Array(FULL_SROM_SIZE_BYTES).fill(0);

	tilesToEmit.forEach((tile) => {
		if (!tile.sromBinaryData) {
			throw new Error(
				`emitSromBinary, a tile lacks sromBinaryData: ${JSON.stringify(tile)}`
			);
		}

		sData.splice(
			tile.sromIndex! * SROM_TILE_SIZE_BYTES,
			SROM_TILE_SIZE_BYTES,
			...tile.sromBinaryData!
		);
	});

	return sData;
}

export { emitSromBinary };
