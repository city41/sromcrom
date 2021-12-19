import { NodeCanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/canvas';
import { CROM_TILE_SIZE_PX } from './constants';
import type { CROMTileSource } from './types';

export function extractCromTileSources(
	context: NodeCanvasRenderingContext2D
): CROMTileSource[][] {
	const result: CROMTileSource[][] = [];

	for (let y = 0; y < context.canvas.height; y += CROM_TILE_SIZE_PX) {
		const row: CROMTileSource[] = [];

		for (let x = 0; x < context.canvas.width; x += CROM_TILE_SIZE_PX) {
			const source = extractSubCanvas(
				context,
				x,
				y,
				CROM_TILE_SIZE_PX,
				CROM_TILE_SIZE_PX
			);
			row.push({ source });
		}

		result.push(row);
	}

	return result;
}
