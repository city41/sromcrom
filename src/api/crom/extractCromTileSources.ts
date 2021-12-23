import { NodeCanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/extractSubCanvas';
import { isCanvasBlank } from '../canvas/isCanvasBlank';
import { CROM_TILE_SIZE_PX } from './constants';
import type { CROMTileMatrix, CROMTileMatrixCol } from './types';

export function extractCromTileSources(
	context: NodeCanvasRenderingContext2D
): CROMTileMatrix {
	const result: CROMTileMatrix = [];

	for (let x = 0; x < context.canvas.width; x += CROM_TILE_SIZE_PX) {
		const col: CROMTileMatrixCol = [];

		for (let y = 0; y < context.canvas.height; y += CROM_TILE_SIZE_PX) {
			const canvasSource = extractSubCanvas(
				context,
				x,
				y,
				CROM_TILE_SIZE_PX,
				CROM_TILE_SIZE_PX
			);

			if (isCanvasBlank(canvasSource)) {
				col.push(null);
			} else {
				col.push({ canvasSource });
			}
		}

		result.push(col);
	}

	return result;
}
