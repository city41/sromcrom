import { CROM_TILE_HALF_SIZE_BYTES } from '../../api/crom/constants';
import { CROMTile } from '../../api/crom/types';

function sortByCromIndex(a: CROMTile, b: CROMTile): number {
	if (a.cromIndex === undefined && b.cromIndex === undefined) {
		return 0;
	}

	if (a.cromIndex !== undefined && b.cromIndex === undefined) {
		return -1;
	}

	if (b.cromIndex !== undefined && a.cromIndex === undefined) {
		return 1;
	}

	return a.cromIndex! - b.cromIndex!;
}

const EMPTY_TILE = new Array(CROM_TILE_HALF_SIZE_BYTES).fill(0);

function emitCromBinaries(sourceTiles: CROMTile[]) {
	const allTiles = [...sourceTiles].sort(sortByCromIndex);

	const cEvenData: number[] = [];
	const cOddData: number[] = [];

	let curIndex = 0;

	for (let i = 0; i < allTiles.length; ++i) {
		const tile = allTiles[i];

		if (tile.duplicateOf || tile.childOf || tile.cromIndex === undefined) {
			continue;
		}

		while (curIndex < tile.cromIndex!) {
			cEvenData.push(...EMPTY_TILE);
			cOddData.push(...EMPTY_TILE);
			++curIndex;
		}

		cEvenData.push(...tile.cromBinaryData.cEvenData);
		cOddData.push(...tile.cromBinaryData.cOddData);

		const childFrames = tile.childAnimationFrames;

		if (childFrames) {
			for (let c = 0; c < childFrames.length; ++c) {
				cEvenData.push(...childFrames[c].cromBinaryData.cEvenData);
				cOddData.push(...childFrames[c].cromBinaryData.cOddData);
				++curIndex;
			}
		}

		++curIndex;
	}

	return { cEvenData, cOddData };
}

export { emitCromBinaries };
