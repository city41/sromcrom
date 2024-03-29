import { BaseTile } from '../../types';

type TileComparator<T> = (a: T, b: T) => boolean;

function markDupes<T extends BaseTile>(
	tiles: T[],
	comparator: TileComparator<T>
) {
	tiles.forEach((tile) => {
		if (tile.duplicateOf) {
			// tile has already been marked as a dupe, nothing to do
			return;
		}

		const matchingTiles = tiles.filter((otherTile) => {
			return (
				otherTile !== tile &&
				!otherTile.duplicateOf &&
				comparator(tile, otherTile)
			);
		});

		matchingTiles.forEach((mt) => {
			mt.duplicateOf = tile;
		});
	});
}

export { markDupes };
export type { BaseTile };
