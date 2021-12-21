import { NodeCanvasRenderingContext2D } from 'canvas';
import { extractSubCanvas } from '../canvas/canvas';
import { CROM_TILE_SIZE_PX } from './constants';
import type { CROMTile } from './types';

export function extractCromTileSources(
	context: NodeCanvasRenderingContext2D
): CROMTile[][] {
	const result: CROMTile[][] = [];

	for (let y = 0; y < context.canvas.height; y += CROM_TILE_SIZE_PX) {
		const row: CROMTile[] = [];

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
