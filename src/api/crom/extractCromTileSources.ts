import { CanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/extractSubCanvas';
import { CROM_TILE_SIZE_PX } from './constants';
import type { CROMTileMatrix, CROMTileMatrixRow } from './types';

export function extractCromTileSources(
	context: CanvasRenderingContext2D
): CROMTileMatrix {
	const result: CROMTileMatrix = [];

	for (let y = 0; y < context.canvas.height; y += CROM_TILE_SIZE_PX) {
		const row: CROMTileMatrixRow = [];

		for (let x = 0; x < context.canvas.width; x += CROM_TILE_SIZE_PX) {
			const canvasSource = extractSubCanvas(
				context,
				x,
				y,
				CROM_TILE_SIZE_PX,
				CROM_TILE_SIZE_PX
			);

			row.push({ canvasSource });
		}

		result.push(row);
	}

	return result;
}
