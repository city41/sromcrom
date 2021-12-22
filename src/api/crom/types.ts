import { Canvas } from 'canvas';
import { FileToWrite, Json } from '../../types';
import { Palette16Bit } from '../palette/types';

export type FourAutoAnimationChildFrames = [CROMTile, CROMTile, CROMTile];
export type EightAutoAnimationChildFrames = [
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile
];

export type CROMTile = {
	canvasSource: Canvas;

	/**
	 * The sixteen bit palette that got assigned to this source.
	 * The source will use this to figure out how to convert into
	 * the indexed format
	 */
	palette?: Palette16Bit;

	/**
	 * Which palette this is in the final 16bit palette array output
	 */
	paletteIndex?: number;

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
	cromBinaryData?: {
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

export type CROMTileMatrixRow = Array<CROMTile | null>;
export type CROMTileMatrix = CROMTileMatrixRow[];

export type ICROMGenerator = {
	jsonKey: string;

	getCROMSources: (rootDir: string, jsonSpec: Json) => CROMTileMatrix[];

	setCROMPositions?: (
		rootDir: string,
		jsonSpec: Json,
		cromTiles: CROMTileMatrix[]
	) => void;

	getCROMSourceFiles?: (
		rootDir: string,
		jsonSpec: Json,
		cromTiles: CROMTileMatrix[]
	) => FileToWrite[];
};
