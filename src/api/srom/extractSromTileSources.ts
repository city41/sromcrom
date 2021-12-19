import { NodeCanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/canvas';
import { SROM_TILE_SIZE_PX } from './constants';
import type { SROMTileSource } from './types';

export function extractSromTileSources(
	context: NodeCanvasRenderingContext2D
): SROMTileSource[][] {
	const result: SROMTileSource[][] = [];

	for (let y = 0; y < context.canvas.height; y += SROM_TILE_SIZE_PX) {
		const row: SROMTileSource[] = [];

		for (let x = 0; x < context.canvas.width; x += SROM_TILE_SIZE_PX) {
			const source = extractSubCanvas(
				context,
				x,
				y,
				SROM_TILE_SIZE_PX,
				SROM_TILE_SIZE_PX
			);
			row.push({ source });
		}

		result.push(row);
	}

	return result;
}
