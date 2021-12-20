import cloneDeep from 'lodash/cloneDeep';

/**
 * If a tile is a dupe, it won't have a sromIndex but instead
 * it will point to what it duplicates. This makes writing tiles
 * during codeEmit more painful. This function takes duped tiles
 * and gives them the same sromIndex as who they are duplicating.
 * Then codeEmit only needs to work with sromIndex and not care
 * about duplicates at all.
 */

type DupableTile = {
	duplicateOf?: DupableTile;
};

export function denormalizeDupes<T extends DupableTile>(
	tiles: T[][][],
	indexProp: keyof T
): T[][][] {
	const cloned = cloneDeep(tiles);

	cloned.forEach((image) => {
		image.forEach((row) => {
			row.forEach((tile) => {
				if (tile.duplicateOf) {
					tile[indexProp] = (tile.duplicateOf as T)[indexProp];
				}
			});
		});
	});

	return cloned;
}
