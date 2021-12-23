import { NodeCanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/extractSubCanvas';
import { isCanvasBlank } from '../canvas/isCanvasBlank';
import { CROM_TILE_SIZE_PX } from './constants';
import type { CROMTileMatrix, CROMTileMatrixSpan } from './types';

export function extractCromTileSources(
	context: NodeCanvasRenderingContext2D,
	order: 'row' | 'column' = 'column'
): CROMTileMatrix {
	const result: CROMTileMatrix = [];

	if (order === 'column') {
		for (let x = 0; x < context.canvas.width; x += CROM_TILE_SIZE_PX) {
			const col: CROMTileMatrixSpan = [];

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
	} else {
		for (let y = 0; y < context.canvas.height; y += CROM_TILE_SIZE_PX) {
			const row: CROMTileMatrixSpan = [];

			for (let x = 0; x < context.canvas.width; x += CROM_TILE_SIZE_PX) {
				const canvasSource = extractSubCanvas(
					context,
					x,
					y,
					CROM_TILE_SIZE_PX,
					CROM_TILE_SIZE_PX
				);

				if (isCanvasBlank(canvasSource)) {
					row.push(null);
				} else {
					row.push({ canvasSource });
				}
			}

			result.push(row);
		}
	}

	return result;
}
