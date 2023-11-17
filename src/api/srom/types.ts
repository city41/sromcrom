import { BaseTile, FileToWrite } from '../../types';

export type SROMTile = BaseTile & {
	/**
	 * The data to place in the srom binary, each number
	 * will be from 0 to 15
	 */
	sromBinaryData?: number[];

	/**
	 * The position in the srom binary for this tile
	 * can be undefined if positionioning hasn't happened yet
	 * or the tile is a dupe
	 */
	sromIndex?: number;
};

export type SROMTileMatrixCol = Array<SROMTile | null>;
export type SROMTileMatrix = SROMTileMatrixCol[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ISROMGenerator<T = any> = {
	jsonKey: string;

	getSROMSources: (rootDir: string, input: T) => SROMTileMatrix[];

	setSROMPositions?: (
		rootDir: string,
		input: T,
		sourceSROMs: SROMTileMatrix[]
	) => void;

	getSROMSourceFiles?: (
		rootDir: string,
		input: T,
		sromTiles: SROMTileMatrix[]
	) => FileToWrite[];
};
