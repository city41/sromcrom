import { CROMTileMatrix } from '../crom/types';

// TODO: support SROM tiles too for srom animations
export function sliceOutFrame(
	tiles: CROMTileMatrix,
	startX: number,
	endX: number
): CROMTileMatrix {
	const rows: CROMTileMatrix = [];

	for (let y = 0; y < tiles.length; ++y) {
		rows.push(tiles[y].slice(startX, endX));
	}

	return rows;
}
