import { CanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/extractSubCanvas';
import { SROM_TILE_SIZE_PX } from './constants';
import type { SROMTileMatrix, SROMTileMatrixCol } from './types';

export function extractSromTileSources(
	context: CanvasRenderingContext2D
): SROMTileMatrix {
	const result: SROMTileMatrix = [];

	for (let y = 0; y < context.canvas.height; y += SROM_TILE_SIZE_PX) {
		const row: SROMTileMatrixCol = [];

		for (let x = 0; x < context.canvas.width; x += SROM_TILE_SIZE_PX) {
			const canvasSource = extractSubCanvas(
				context,
				x,
				y,
				SROM_TILE_SIZE_PX,
				SROM_TILE_SIZE_PX
			);

			row.push({ canvasSource });
		}

		result.push(row);
	}

	return result;
}
