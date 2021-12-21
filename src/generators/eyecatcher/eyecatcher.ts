import path from 'path';
import { createCanvas, NodeCanvasRenderingContext2D } from 'canvas';
import { TRANSPARENT_24BIT_COLOR } from '../../api/palette/colors';
import { CROM_TILE_SIZE_PX } from '../../api/crom/constants';
import { getCanvasContextFromImagePath } from '../../api/canvas/canvas';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import type { CROMTile, ICROMGenerator } from '../../api/crom/types';
import { ISROMGenerator, SROMTile } from '../../api/srom/types';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { SROM_TILE_SIZE_PX } from '../../api/srom/constants';
import { Json } from '../../types';
import { isEqual } from 'lodash';

type EyeCatcherJSONSpec = {
	mainLogoImageFile: string;
	max330MegaImageFile?: string;
	proGearSpecImageFile?: string;
	snkLogoImageFile?: string;
	copyrightCharacter?: string;
};

type Size = {
	width: number;
	height: number;
};

const EYECATCHER_MAIN_IMAGE_SIZE_TILES = {
	width: 14,
	height: 4,
};
const EYECATCHER_MAIN_IMAGE_SIZE_PX = {
	width: EYECATCHER_MAIN_IMAGE_SIZE_TILES.width * CROM_TILE_SIZE_PX,
	height: EYECATCHER_MAIN_IMAGE_SIZE_TILES.height * CROM_TILE_SIZE_PX,
};

const EYECATCHER_MAX_330_MEGA_SIZE_TILES = {
	width: 15,
	height: 2,
};
const EYECATCHER_MAX_330_MEGA_SIZE_PX = {
	width: EYECATCHER_MAX_330_MEGA_SIZE_TILES.width * SROM_TILE_SIZE_PX,
	height: EYECATCHER_MAX_330_MEGA_SIZE_TILES.height * SROM_TILE_SIZE_PX,
};

const EYECATCHER_PRO_GEAR_SPEC_SIZE_TILES = {
	width: 17,
	height: 2,
};
const EYECATCHER_PRO_GEAR_SPEC_SIZE_PX = {
	width: EYECATCHER_PRO_GEAR_SPEC_SIZE_TILES.width * SROM_TILE_SIZE_PX,
	height: EYECATCHER_PRO_GEAR_SPEC_SIZE_TILES.height * SROM_TILE_SIZE_PX,
};

const EYECATCHER_COMPANY_LOGO_SIZE_TILES = {
	width: 10,
	height: 3,
};
const EYECATCHER_COMPANY_LOGO_SIZE_PX = {
	width: EYECATCHER_COMPANY_LOGO_SIZE_TILES.width * SROM_TILE_SIZE_PX,
	height: EYECATCHER_COMPANY_LOGO_SIZE_TILES.height * SROM_TILE_SIZE_PX,
};
const EYECATCHER_COPYRIGHT_SIZE_TILES = {
	width: 1,
	height: 1,
};
const EYECATCHER_COPYRIGHT_SIZE_PX = {
	width: EYECATCHER_COPYRIGHT_SIZE_TILES.width * SROM_TILE_SIZE_PX,
	height: EYECATCHER_COPYRIGHT_SIZE_TILES.height * SROM_TILE_SIZE_PX,
};

// taken from https://wiki.neogeodev.org/index.php?title=Eyecatcher
const MAX_330_MEGA_TILE_POSITIONS = [
	[
		0x05, 0x07, 0x09, 0x0b, 0x0d, 0x0f, 0x15, 0x17, 0x19, 0x1b, 0x1d, 0x1f,
		0x5e, 0x60, 0x7d,
	],
	[
		0x06, 0x08, 0x0a, 0x0c, 0x0e, 0x14, 0x16, 0x18, 0x1a, 0x1c, 0x1e, 0x40,
		0x5f, 0x7c, 0x7e,
	],
];

const PRO_GEAR_SPEC_TILE_POSITIONS = [
	[
		0x7f, 0x9a, 0x9c, 0x9e, 0xff, 0xbb, 0xbd, 0xbf, 0xda, 0xdc, 0xde, 0xfa,
		0xfc, 0x100, 0x102, 0x104, 0x106,
	],
	[
		0x99, 0x9b, 0x9d, 0x9f, 0xba, 0xbc, 0xbe, 0xd9, 0xdb, 0xdd, 0xdf, 0xfb,
		0xfd, 0x101, 0x103, 0x105, 0x107,
	],
];

const COMPANY_LOGO_TILE_POSITIONS = [
	[0x200, 0x201, 0x202, 0x203, 0x204, 0x205, 0x206, 0x207, 0x208, 0x209],
	[0x20a, 0x20b, 0x20c, 0x20d, 0x20e, 0x20f, 0x214, 0x215, 0x216, 0x217],
	[0x218, 0x219, 0x21a, 0x21b, 0x21c, 0x21d, 0x21e, 0x21f, 0x240, 0x25e],
];

const COPYRIGHT_TILE_POSITIONS = [[0x7b]];

function getSROMSource(imagePath: string, expectedSize: Size): SROMTile[][] {
	const context = getCanvasContextFromImagePath(imagePath);
	const { width, height } = context.canvas;

	if (width !== expectedSize.width || height !== expectedSize.height) {
		throw new Error(
			`eyecatcher image, ${imagePath}, is wrong size. Should be ${expectedSize.width}x${expectedSize.height}, but is ${width}x${height}`
		);
	}

	return extractSromTileSources(context);
}

function setSROMPositions(sromTiles: SROMTile[][], positions: number[][]) {
	for (let y = 0; y < positions.length; ++y) {
		for (let x = 0; x < positions[y].length; ++x) {
			sromTiles[y][x].sromIndex = positions[y][x];
		}
	}
}

function widenMainImageByOneTile(
	inputContext: NodeCanvasRenderingContext2D
): NodeCanvasRenderingContext2D {
	const destCanvas = createCanvas(
		EYECATCHER_MAIN_IMAGE_SIZE_PX.width,
		EYECATCHER_MAIN_IMAGE_SIZE_PX.height
	);
	const destContext = destCanvas.getContext('2d');

	destContext.drawImage(inputContext.canvas, 0, 0);

	return destContext;
}

function isTileForFFBlank(sromTileSources: SROMTile[][]): boolean {
	const tile = sromTileSources[0][4];

	const context = tile.canvasSource.getContext('2d');
	const imageData = context.getImageData(
		0,
		0,
		tile.canvasSource.width,
		tile.canvasSource.height
	);

	for (let p = 0; p < imageData.data.length; p += 4) {
		const pixel = Array.from(imageData.data.slice(p, p + 4));

		if (!isEqual(pixel, TRANSPARENT_24BIT_COLOR)) {
			return false;
		}
	}

	return true;
}

const eyecatcher: ICROMGenerator & ISROMGenerator = {
	jsonKey: 'eyecatcher',

	getCROMSources(rootDir: string, jsonSpec: Json): CROMTile[][][] {
		const { mainLogoImageFile } = jsonSpec as EyeCatcherJSONSpec;

		const cRomImagePath = path.resolve(rootDir, mainLogoImageFile);

		const context = getCanvasContextFromImagePath(cRomImagePath);
		const { width, height } = context.canvas;

		if (
			width !== EYECATCHER_MAIN_IMAGE_SIZE_PX.width ||
			height !== EYECATCHER_MAIN_IMAGE_SIZE_PX.height
		) {
			throw new Error(
				`eyecatcher image is wrong size. Should be ${EYECATCHER_MAIN_IMAGE_SIZE_PX.width}x${EYECATCHER_MAIN_IMAGE_SIZE_PX.height}, but is ${width}x${height}`
			);
		}

		// even though the eye catcher is technically 15 tiles wide, the last column
		// is strange. the top and bottom is not in the crom, and the middle tiles
		// should be blank. The way we are enforcing this, is requiring an image that is 14
		// tiles wide, then appending a blank tile column to the end
		const finalContext = widenMainImageByOneTile(context);

		return [extractCromTileSources(finalContext)];
	},

	getSROMSources(rootDir: string, jsonSpec: Json) {
		const {
			max330MegaImageFile,
			proGearSpecImageFile,
			snkLogoImageFile,
			copyrightCharacter,
		} = jsonSpec as EyeCatcherJSONSpec;

		const sources: SROMTile[][][] = [];

		if (max330MegaImageFile) {
			sources.push(
				getSROMSource(
					path.resolve(rootDir, max330MegaImageFile),
					EYECATCHER_MAX_330_MEGA_SIZE_PX
				)
			);
		}

		if (proGearSpecImageFile) {
			const proGearSource = getSROMSource(
				path.resolve(rootDir, proGearSpecImageFile),
				EYECATCHER_PRO_GEAR_SPEC_SIZE_PX
			);
			sources.push(proGearSource);

			if (!isTileForFFBlank(proGearSource)) {
				console.warn(
					'proGearSpecImageFile: the tile that will be placed at 0xff in the SROM binary (at {64px,0px} in the image) is not blank. That tile will be drawn over the entire fix layer in many situations.'
				);
			}
		}

		if (snkLogoImageFile) {
			sources.push(
				getSROMSource(
					path.resolve(rootDir, snkLogoImageFile),
					EYECATCHER_COMPANY_LOGO_SIZE_PX
				)
			);
		}

		if (copyrightCharacter) {
			sources.push(
				getSROMSource(
					path.resolve(rootDir, copyrightCharacter),
					EYECATCHER_COPYRIGHT_SIZE_PX
				)
			);
		}

		return sources;
	},

	setCROMPositions(_rootDir: string, _json: Json, images: CROMTile[][][]) {
		let eyeCatcherIndex = 0;

		const eyecatcherMainImage = images[0];

		for (let y = 0; y < eyecatcherMainImage.length; ++y) {
			for (let x = 0; x < eyecatcherMainImage[y].length; ++x) {
				if ((y === 0 || y === 3) && x === 14) {
					// upper right corner or lower right corner, which should not be emitted
					eyecatcherMainImage[y][x].duplicateOf = eyecatcherMainImage[0][0];
				} else {
					eyecatcherMainImage[y][x].cromIndex = eyeCatcherIndex++;

					// ensure these tiles are totally static and not involved
					// in any duplication or auto animations
					// TODO: a better way to handle this
					delete eyecatcherMainImage[y][x].duplicateOf;
					delete eyecatcherMainImage[y][x].childOf;
					delete eyecatcherMainImage[y][x].childAnimationFrames;
				}
			}
		}
	},

	setSROMPositions(_rootDir: string, _json: Json, sromTiles: SROMTile[][][]) {
		// TODO: use the json to figure out which images are present

		const max330Image = sromTiles.find((i) => {
			return (
				i.length === EYECATCHER_MAX_330_MEGA_SIZE_TILES.height &&
				i[0].length === EYECATCHER_MAX_330_MEGA_SIZE_TILES.width
			);
		});

		if (max330Image) {
			setSROMPositions(max330Image, MAX_330_MEGA_TILE_POSITIONS);
		}

		const proGearImage = sromTiles.find((i) => {
			return (
				i.length === EYECATCHER_PRO_GEAR_SPEC_SIZE_TILES.height &&
				i[0].length === EYECATCHER_PRO_GEAR_SPEC_SIZE_TILES.width
			);
		});

		if (proGearImage) {
			setSROMPositions(proGearImage, PRO_GEAR_SPEC_TILE_POSITIONS);
		}

		const companyImage = sromTiles.find((i) => {
			return (
				i.length === EYECATCHER_COMPANY_LOGO_SIZE_TILES.height &&
				i[0].length === EYECATCHER_COMPANY_LOGO_SIZE_TILES.width
			);
		});

		if (companyImage) {
			setSROMPositions(companyImage, COMPANY_LOGO_TILE_POSITIONS);
		}

		const copyrightImage = sromTiles.find((i) => {
			return (
				i.length === EYECATCHER_COPYRIGHT_SIZE_TILES.height &&
				i[0].length === EYECATCHER_COPYRIGHT_SIZE_TILES.width
			);
		});

		if (copyrightImage) {
			setSROMPositions(copyrightImage, COPYRIGHT_TILE_POSITIONS);
		}
	},
};

export { eyecatcher };
