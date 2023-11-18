import cloneDeep from 'lodash/cloneDeep';

/**
 * If a tile is a dupe, it won't have a c/sromIndex but instead
 * it will point to what it duplicates. This makes writing tiles
 * during codeEmit more painful. This function takes duped tiles
 * and gives them the same c/sromIndex as who they are duplicating.
 * Then codeEmit only needs to work with sromIndex and not care
 * about duplicates at all.
 */

type DupableTile = {
	duplicateOf?: DupableTile;
};

type MatrixRow<T extends DupableTile> = Array<T | null>;
type Matrix<T extends DupableTile> = MatrixRow<T>[];

export function denormalizeDupes<T extends DupableTile>(
	tiles: Matrix<T>[],
	indexProp: keyof T
): Matrix<T>[] {
	const cloned = cloneDeep(tiles);

	cloned.forEach((image) => {
		image.forEach((row) => {
			row.forEach((tile) => {
				if (tile?.duplicateOf) {
					tile[indexProp] = (tile.duplicateOf as T)[indexProp];
				}
			});
		});
	});

	return cloned;
}
