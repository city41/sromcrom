import { Canvas } from 'canvas';
import { FileToWrite, Json } from '../../types';
import { Palette16Bit } from '../palette/types';

export type SROMTile = {
	/**
	 * the modern png/aseprite source for this tile,
	 */
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
	duplicateOf?: SROMTile;

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

export type ISROMGenerator = {
	jsonKey: string;

	getSROMSources: (rootDir: string, jsonSpec: Json) => SROMTileMatrix[];

	setSROMPositions?: (
		rootDir: string,
		jsonSpec: Json,
		sourceSROMs: SROMTileMatrix[]
	) => void;

	getSROMSourceFiles?: (
		rootDir: string,
		jsonSpec: Json,
		sromTiles: SROMTileMatrix[]
	) => FileToWrite[];
};
