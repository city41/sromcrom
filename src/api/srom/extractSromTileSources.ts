import { NodeCanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/canvas';
import { SROM_TILE_SIZE_PX } from './constants';
import type { SROMTile } from './types';

export function extractSromTileSources(
	context: NodeCanvasRenderingContext2D
): SROMTile[][] {
	const result: SROMTile[][] = [];

	for (let y = 0; y < context.canvas.height; y += SROM_TILE_SIZE_PX) {
		const row: SROMTile[] = [];

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
