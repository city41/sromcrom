import { createCanvas } from 'canvas';
import { CROM_TILE_SIZE_PX } from '../../api/crom/constants';
import { ICROMGenerator } from '../../api/crom/types';

const BLANK_TILE_CANVAS = (function () {
	const canvas = createCanvas(CROM_TILE_SIZE_PX, CROM_TILE_SIZE_PX);
	const context = canvas.getContext('2d');
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	// create a magenta tile
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
const cromFFBlankGenerator: ICROMGenerator = {
	jsonKey: 'ignored',
	getCROMSources(_rootDir, _jsonSpec) {
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
	setCROMPositions(_rootDir, _jsonSpec, cromTiles) {
		cromTiles[0][0][0]!.cromIndex = 0xff;
	},
};

export { cromFFBlankGenerator };
