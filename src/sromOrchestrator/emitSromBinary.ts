import { SROM_TILE_SIZE_BYTES } from '../api/srom/constants';
import { SROMTile } from '../api/srom/types';

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

const EMPTY_TILE = new Array(SROM_TILE_SIZE_BYTES).fill(0);

function emitSromBinary(allTiles: SROMTile[]) {
	allTiles.sort(sortBySromIndex);

	const sData: number[] = [];

	let curIndex = 0;

	for (let i = 0; i < allTiles.length; ++i) {
		const tile = allTiles[i];

		if (tile.duplicateOf || tile.sromIndex === undefined) {
			continue;
		}

		while (curIndex < tile.sromIndex!) {
			sData.push(...EMPTY_TILE);
			++curIndex;
		}

		sData.push(...tile.sromBinaryData);

		++curIndex;
	}

	return sData;
}

export { emitSromBinary };
