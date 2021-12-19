type TileComparator<T> = (a: T, b: T) => boolean;

type BaseTile = {
	duplicateOf?: BaseTile;
};

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
			return otherTile !== tile && comparator(tile, otherTile);
		});

		matchingTiles.forEach((mt) => {
			mt.duplicateOf = tile;
		});
	});
}

export { markDupes };
export type { BaseTile };
