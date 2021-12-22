import { NodeCanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/extractSubCanvas';
import { isCanvasBlank } from '../canvas/isCanvasBlank';
import { SROM_TILE_SIZE_PX } from './constants';
import type { SROMTileMatrix, SROMTileMatrixRow } from './types';

export function extractSromTileSources(
	context: NodeCanvasRenderingContext2D
): SROMTileMatrix {
	const result: SROMTileMatrix = [];

	for (let y = 0; y < context.canvas.height; y += SROM_TILE_SIZE_PX) {
		const row: SROMTileMatrixRow = [];

		for (let x = 0; x < context.canvas.width; x += SROM_TILE_SIZE_PX) {
			const canvasSource = extractSubCanvas(
				context,
				x,
				y,
				SROM_TILE_SIZE_PX,
				SROM_TILE_SIZE_PX
			);

			if (isCanvasBlank(canvasSource)) {
				row.push(null);
			} else {
				row.push({ canvasSource });
			}
		}

		result.push(row);
	}

	return result;
}
