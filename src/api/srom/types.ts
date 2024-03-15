import { BaseTile } from '../../types';

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

	/**
	 * If multiple tiles end up with the same sromIndex, the one with
	 * a highest priority value will be emitted and the others elided.
	 * If multiple tiles have the same index and priority, then it's
	 * undefined which one gets into the binary
	 */
	priority?: number;
};

export type SROMTileMatrixCol = SROMTile[];
export type SROMTileMatrix = SROMTileMatrixCol[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SROMSourceResult<TInput = any> = {
	tiles: SROMTileMatrix;
	input: TInput;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ISROMGenerator<TInput = any, TEntry = any, TCEmit = any> = {
	jsonKey: string;

	getSROMSources: (
		rootDir: string,
		input: TInput
	) => SROMSourceResult<TEntry>[];

	setSROMPositions?: (
		rootDir: string,
		input: TInput,
		sromSourceResults: SROMSourceResult[]
	) => void;

	getCodeEmitData?: (
		rootDir: string,
		input: TInput,
		sromSourceResults: SROMSourceResult[]
	) => TCEmit;
};
