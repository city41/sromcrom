import cloneDeep from 'lodash/cloneDeep';
import { Canvas } from 'canvas';

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
	canvasSource?: Canvas;
};

type MatrixRow<T extends DupableTile> = T[];
type Matrix<T extends DupableTile> = MatrixRow<T>[];

/**
 * A Canvas cannot be cloned. So this method clones but copies the original Canvas
 * ref, if any, back onto the clone
 */
function cloneDeepExceptCanvasSource<T extends DupableTile>(
	tiles: Matrix<T>[]
): Matrix<T>[] {
	const cloned = cloneDeep(tiles);

	cloned.forEach((image, i) => {
		image.forEach((row, r) => {
			row.forEach((clonedTile, t) => {
				if (clonedTile) {
					const originalTile = tiles[i][r][t];

					if (
						originalTile &&
						typeof originalTile.canvasSource !== 'undefined'
					) {
						clonedTile.canvasSource = originalTile.canvasSource;
					}
				}
			});
		});
	});

	return cloned;
}

export function denormalizeDupes<T extends DupableTile>(
	tiles: Matrix<T>[],
	indexProp: keyof T
): Matrix<T>[] {
	const cloned = cloneDeepExceptCanvasSource(tiles);

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
