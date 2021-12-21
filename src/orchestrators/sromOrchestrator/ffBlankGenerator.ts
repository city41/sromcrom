import { createCanvas } from 'canvas';
import { SROM_TILE_SIZE_PX } from '../../api/srom/constants';
import { ISROMGenerator } from '../../api/srom/types';

const BLANK_TILE_CANVAS = (function () {
	const canvas = createCanvas(SROM_TILE_SIZE_PX, SROM_TILE_SIZE_PX);
	const context = canvas.getContext('2d');
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	for (let p = 0; p < imageData.data.length; p += 4) {
		imageData.data[p] = 255; // red channel
		imageData.data[p + 1] = 0; // green channel
		imageData.data[p + 2] = 255; // blue channel
		imageData.data[p + 3] = 255; // alpha channel
	}

	context.putImageData(imageData, 0, 0);

	return canvas;
})();

/**
 * The tile at 0xff needs to be blank, as several
 * parts of the hardware use it for things like clearing
 * the screen and drawing the eyecatcher
 *
 * This generator is a simple one that just pushes on a blank tile
 * positioned at 0xff
 */
const ffBlankGenerator: ISROMGenerator = {
	jsonKey: 'ignored',
	getSROMSources(_rootDir, _jsonSpec) {
		return [
			[
				[
					{
						canvasSource: BLANK_TILE_CANVAS,
					},
				],
			],
		];
	},
	setSROMPositions(_rootDir, _jsonSpec, sromTiles) {
		sromTiles[0][0][0].sromIndex = 0xff;
	},
};

export { ffBlankGenerator };
