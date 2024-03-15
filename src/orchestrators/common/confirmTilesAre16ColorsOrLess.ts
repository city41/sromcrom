import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import * as mkdirp from 'mkdirp';
import { get24BitPalette } from '../../api/palette/get24BitPalette';
import { BaseTile } from '../../types';

/**
 * Verifies all tiles are 16 colors or less. This takes into account index 0/transparency,
 * as get24BitPalette will ensure the palette has transparency at zero
 * @param tiles
 */
function confirmTilesAre16ColorsOrLess<TTile extends BaseTile>(tiles: TTile[]) {
	const badTiles = tiles.filter((t) => {
		return get24BitPalette(t.canvasSource).length > 16;
	});

	if (badTiles.length > 0) {
		const tmpDir = path.resolve(
			os.tmpdir(),
			`sromcromBadTiles-${Date.now().toString()}`
		);

		mkdirp.sync(tmpDir);

		for (let i = 0; i < badTiles.length; ++i) {
			const tile = badTiles[i];
			const paletteLength = get24BitPalette(tile.canvasSource).length;
			const buffer = tile.canvasSource.toBuffer();

			const tilePath = path.resolve(tmpDir, `tile-${i}-${paletteLength}.png`);

			fs.writeFileSync(tilePath, buffer);
		}

		throw new Error(
			`Some tiles have more than 16 colors, bad tiles written to: ${tmpDir}`
		);
	}
}

export { confirmTilesAre16ColorsOrLess };
