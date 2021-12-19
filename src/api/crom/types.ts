import { Canvas } from 'canvas';
import { FileToWrite, Json } from '../../types';
import { Palette16Bit } from '../palette/types';

export type FourAutoAnimationChildFrameSources = [Canvas, Canvas, Canvas];
export type FourAutoAnimationChildFrames = [CROMTile, CROMTile, CROMTile];

export type EightAutoAnimationChildFrameSources = [
	Canvas,
	Canvas,
	Canvas,
	Canvas,
	Canvas,
	Canvas,
	Canvas
];
export type EightAutoAnimationChildFrames = [
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile
];

export type CROMTileSource = {
	/**
	 * the modern png/aseprite source for this tile,
	 */
	source: Canvas;
	childAnimationFrameSources?:
		| FourAutoAnimationChildFrameSources
		| EightAutoAnimationChildFrameSources;
};

export type CROMTileSourceWithPalette = CROMTileSource & {
	/**
	 * The sixteen bit palette that got assigned to this source.
	 * The source will use this to figure out how to convert into
	 * the indexed format
	 */
	palette: Palette16Bit;

	/**
	 * Which palette this is in the final 16bit palette array output
	 */
	paletteIndex: number;
};

export type CROMTile = CROMTileSourceWithPalette & {
	/**
	 * If this tile is a duplicate of another, then
	 * this points to the other tile it duplicates
	 */
	duplicateOf?: CROMTile;

	/**
	 * If this tile is a child animation frame of an
	 * auto animation, this points to the master tile
	 */
	childOf?: CROMTile;

	/**
	 * If this tile is the start of an auto animation,
	 * then the rest of its frames are stored here
	 */
	childAnimationFrames?:
		| FourAutoAnimationChildFrames
		| EightAutoAnimationChildFrames;

	/**
	 * The data to place in the crom binary, each number
	 * will be from 0 to 15
	 */
	cromBinaryData: {
		cEvenData: number[];
		cOddData: number[];
	};

	/**
	 * The position in the crom binary for this tile
	 * can be undefined if positionioning hasn't happened yet
	 * or the tile is a dupe
	 */
	cromIndex?: number;
};

/**
 * A CROM that is also a tile in a Tiled editor tileset
 */
export type TiledCROMTile = CROMTile & {
	/**
	 * This tile's id in Tiled. Used to associate
	 * a Tiled design level to the CROM index
	 */
	tiledId: number;
};

export type ICROMGenerator = {
	jsonKey: string;

	getCROMSources: (rootDir: string, jsonSpec: Json) => CROMTileSource[][][];

	setCROMPositions?: (
		rootDir: string,
		jsonSpec: Json,
		cromTiles: CROMTile[][][]
	) => void;

	getCROMSourceFiles?: (
		rootDir: string,
		jsonSpec: Json,
		cromTiles: CROMTile[][][]
	) => FileToWrite[];
};
