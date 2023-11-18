import { FileToWrite } from '../../types';
import { BaseTile } from '../tile/markDupes';

export type FourAutoAnimationChildFrames = [CROMTile, CROMTile, CROMTile];
export type EightAutoAnimationChildFrames = [
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
	CROMTile,
];

export type CROMTile = BaseTile & {
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
	 * can be undefined if positioning hasn't happened yet
	 * or the tile is a dupe
	 */
	cromIndex?: number;
};

export type CROMTileMatrixRow = Array<CROMTile | null>;
export type CROMTileMatrix = CROMTileMatrixRow[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ICROMGenerator<T = any> = {
	jsonKey: string;

	getCROMSources: (rootDir: string, input: T) => CROMTileMatrix[];

	setCROMPositions?: (
		rootDir: string,
		input: T,
		cromTiles: CROMTileMatrix[]
	) => void;

	getCROMSourceFiles?: (
		rootDir: string,
		input: T,
		cromTiles: CROMTileMatrix[]
	) => FileToWrite[];
};
