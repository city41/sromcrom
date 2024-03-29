import path from 'path';
import { CanvasRenderingContext2D } from 'canvas';
import isEqual from 'lodash/isEqual';
import {
	TRANSPARENT_16BIT_COLOR,
	TRANSPARENT_VIA_MAGENTA_24BIT_COLOR,
} from '../../api/palette/colors';
import { CROM_TILE_SIZE_PX } from '../../api/crom/constants';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import type { ICROMGenerator } from '../../api/crom/types';
import {
	ISROMGenerator,
	SROMSourceResult,
	SROMTile,
	SROMTileMatrix,
} from '../../api/srom/types';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { SROM_TILE_SIZE_PX } from '../../api/srom/constants';
import { EyeCatcherJsonSpec } from '../../types';
import { Palette16Bit } from '../../api/palette/types';
import { get24BitPalette } from '../../api/palette/get24BitPalette';
import { convertTo16BitPaletteIgnoreDarkBit } from '../../api/palette/convertTo16Bit';

type Size = {
	width: number;
	height: number;
};

const EYECATCHER_MAIN_IMAGE_SIZE_TILES = {
	width: 15,
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
const MAIN_IMAGE_TILE_POSITIONS = [
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
	[14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
	[29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
	[44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
];

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

// as they eyecatcher animates the palette changes, but this is the palette in its final form.
// all parts of the eyecatcher use this same palette. Color 5 is "SNK blue"
const EYECATCHER_PALETTE: Palette16Bit = [
	// the palette was altered for sromcrom, the first color is now magenta instead of 0x0000. That way all magenta pixels
	// in source eyecatcher images get mapped to index zero
	TRANSPARENT_16BIT_COLOR,
	0x0fff,
	0x0ddd,
	0x0aaa,
	0x7555,
	0x306e,
	0x0000,
	0x0000,
	0x0000,
	0x0000,
	0x0000,
	0x0000,
	0x0000,
	0x0000,
	0x0000,
	0x0000,
];

function matchesEyecatcherPalette(context: CanvasRenderingContext2D): boolean {
	const palette24 = get24BitPalette(context.canvas);
	const palette16 = convertTo16BitPaletteIgnoreDarkBit(palette24);

	return palette16.every((p16) => {
		return EYECATCHER_PALETTE.includes(p16);
	});
}

function getSROMSource(imagePath: string, expectedSize: Size): SROMTileMatrix {
	const context = getCanvasContextFromImagePath(imagePath);
	const { width, height } = context.canvas;

	if (width !== expectedSize.width || height !== expectedSize.height) {
		throw new Error(
			`eyecatcher image, ${imagePath}, is the wrong size. Should be ${expectedSize.width}x${expectedSize.height}, but is ${width}x${height}`
		);
	}

	if (!matchesEyecatcherPalette(context)) {
		throw new Error(
			`The eyecatcher image, ${imagePath}, cannot be rendered with the system eyecatcher palette`
		);
	}

	const sromImage = extractSromTileSources(context);

	sromImage.forEach((col) => {
		col.forEach((tile) => {
			if (tile) {
				tile.palette = EYECATCHER_PALETTE;
				tile.emitPalette = false;
				tile.paletteIgnoresDarkBit = true;
				// make sure eyecatcher tiles clobber any other tile
				// that wants the same position
				tile.priority = Number.MAX_SAFE_INTEGER;
			}
		});
	});

	return sromImage;
}

function setSROMPositions(sromTiles: SROMTile[][], positions: number[][]) {
	for (let y = 0; y < positions.length; ++y) {
		for (let x = 0; x < positions[y].length; ++x) {
			sromTiles[y][x].sromIndex = positions[y][x];
			// ensure these tiles are totally static and not involved
			// in any duplication
			// TODO: a better way to handle this
			delete sromTiles[y][x]!.duplicateOf;
		}
	}
}

function isTileBlank(tile: SROMTile): boolean {
	const context = tile.canvasSource.getContext('2d');
	const imageData = context.getImageData(
		0,
		0,
		tile.canvasSource.width,
		tile.canvasSource.height
	);

	for (let p = 0; p < imageData.data.length; p += 4) {
		const color = Array.from(imageData.data.slice(p, p + 4));

		if (
			imageData.data[p + 3] !== 0 &&
			!isEqual(color, TRANSPARENT_VIA_MAGENTA_24BIT_COLOR)
		) {
			return false;
		}
	}

	return true;
}

const eyecatcher: ICROMGenerator<EyeCatcherJsonSpec> &
	ISROMGenerator<EyeCatcherJsonSpec, string> = {
	jsonKey: 'eyecatcher',

	getCROMSources(rootDir, input) {
		const { mainLogoImageFile } = input;

		const cRomImagePath = path.resolve(rootDir, mainLogoImageFile);

		const context = getCanvasContextFromImagePath(cRomImagePath);
		const { width, height } = context.canvas;

		if (
			width !== EYECATCHER_MAIN_IMAGE_SIZE_PX.width ||
			height !== EYECATCHER_MAIN_IMAGE_SIZE_PX.height
		) {
			throw new Error(
				`The eyecatcher main logo image is the wrong size. Should be ${EYECATCHER_MAIN_IMAGE_SIZE_PX.width}x${EYECATCHER_MAIN_IMAGE_SIZE_PX.height}, but is ${width}x${height}`
			);
		}

		if (!matchesEyecatcherPalette(context)) {
			throw new Error(
				'The eyecatcher main logo image cannot be rendered with the system eyecatcher palette'
			);
		}

		const cromTileSources = extractCromTileSources(context);
		// these tiles should not be emitted into the rom, so rip them out
		// but hold onto them to assert on them just below
		const [upperRightCorner] = cromTileSources[0].splice(14, 1);
		const [lowerRightCorner] = cromTileSources[3].splice(14, 1);

		if (!isTileBlank(upperRightCorner)) {
			throw new Error(
				'The eyecatcher main logo image must have a blank tile in the upper right corner (all magenta), as it will be thrown away'
			);
		}

		if (!isTileBlank(lowerRightCorner)) {
			throw new Error(
				'The eyecatcher main logo image must have a blank tile in the lower right corner (all magenta), as it will be thrown away'
			);
		}

		cromTileSources.forEach((row) => {
			row.forEach((tile) => {
				if (tile) {
					tile.palette = EYECATCHER_PALETTE;
					tile.emitPalette = false;
					tile.paletteIgnoresDarkBit = true;
				}
			});
		});

		return [cromTileSources];
	},

	getSROMSources(rootDir, input) {
		const {
			max330MegaImageFile,
			proGearSpecImageFile,
			snkLogoImageFile,
			copyrightCharacterImageFile,
		} = input;

		const sources: SROMSourceResult[] = [];

		if (max330MegaImageFile) {
			sources.push({
				tiles: getSROMSource(
					path.resolve(rootDir, max330MegaImageFile),
					EYECATCHER_MAX_330_MEGA_SIZE_PX
				),
				input: max330MegaImageFile,
			});
		}

		if (proGearSpecImageFile) {
			const proGearSource = getSROMSource(
				path.resolve(rootDir, proGearSpecImageFile),
				EYECATCHER_PRO_GEAR_SPEC_SIZE_PX
			);

			const tileAtFF = proGearSource[0][4];
			if (!isTileBlank(tileAtFF)) {
				throw new Error(
					'proGearSpecImageFile: the tile that will be placed at 0xff in the SROM binary (at {32px,0px} in the image) is not fully blank. That tile will be drawn over the entire fix layer in many situations. It should be an entirely transparent or magenta tile.'
				);
			}

			sources.push({
				tiles: proGearSource,
				input: proGearSpecImageFile,
			});
		}

		if (snkLogoImageFile) {
			sources.push({
				tiles: getSROMSource(
					path.resolve(rootDir, snkLogoImageFile),
					EYECATCHER_COMPANY_LOGO_SIZE_PX
				),
				input: snkLogoImageFile,
			});
		}

		if (copyrightCharacterImageFile) {
			sources.push({
				tiles: getSROMSource(
					path.resolve(rootDir, copyrightCharacterImageFile),
					EYECATCHER_COPYRIGHT_SIZE_PX
				),
				input: copyrightCharacterImageFile,
			});
		}

		return sources;
	},

	setCROMPositions(_rootDir, _json, images) {
		const eyecatcherMainImage = images[0];

		for (let y = 0; y < eyecatcherMainImage.length; ++y) {
			for (let x = 0; x < eyecatcherMainImage[y].length; ++x) {
				const cromIndex = MAIN_IMAGE_TILE_POSITIONS[y]?.[x];

				if (typeof cromIndex === 'number') {
					eyecatcherMainImage[y][x]!.cromIndex = cromIndex;
					// ensure these tiles are totally static and not involved
					// in any duplication or auto animations
					// TODO: a better way to handle this
					delete eyecatcherMainImage[y][x]!.duplicateOf;
					delete eyecatcherMainImage[y][x]!.childOf;
					delete eyecatcherMainImage[y][x]!.childAnimationFrames;
				}
			}
		}
	},

	setSROMPositions(_rootDir, eyecatcherJson, sromSourceResults) {
		const max330Image = sromSourceResults.find((ssr) => {
			return ssr.input === eyecatcherJson.max330MegaImageFile;
		});

		if (max330Image) {
			setSROMPositions(
				max330Image.tiles as SROMTile[][],
				MAX_330_MEGA_TILE_POSITIONS
			);
		}

		const proGearImage = sromSourceResults.find((ssr) => {
			return ssr.input === eyecatcherJson.proGearSpecImageFile;
		});

		if (proGearImage) {
			setSROMPositions(
				proGearImage.tiles as SROMTile[][],
				PRO_GEAR_SPEC_TILE_POSITIONS
			);
		}

		const companyImage = sromSourceResults.find((ssr) => {
			return ssr.input === eyecatcherJson.snkLogoImageFile;
		});

		if (companyImage) {
			setSROMPositions(
				companyImage.tiles as SROMTile[][],
				COMPANY_LOGO_TILE_POSITIONS
			);
		}

		const copyrightImage = sromSourceResults.find((ssr) => {
			return ssr.input === eyecatcherJson.copyrightCharacterImageFile;
		});

		if (copyrightImage) {
			setSROMPositions(
				copyrightImage.tiles as SROMTile[][],
				COPYRIGHT_TILE_POSITIONS
			);
		}
	},
};

export { eyecatcher };
