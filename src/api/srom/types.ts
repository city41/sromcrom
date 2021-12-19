import { Canvas } from 'canvas';
import { FileToWrite } from '../../types';
import { Palette16Bit } from '../palette/types';

export type SROMTileSource = {
	/**
	 * the modern png/aseprite source for this tile,
	 */
	source: Canvas;
};

export type SROMTileSourceWithPalette = SROMTileSource & {
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

export type SROMTile = SROMTileSourceWithPalette & {
	/**
	 * If this tile is a duplicate of another, then
	 * this points to the other tile it duplicates
	 */
	duplicateOf?: SROMTile;

	/**
	 * The data to place in the srom binary, each number
	 * will be from 0 to 15
	 */
	sromBinaryData: number[];

	/**
	 * The position in the srom binary for this tile
	 * can be undefined if positionioning hasn't happened yet
	 * or the tile is a dupe
	 */
	sromIndex?: number;
};

export type ISROMGenerator = {
	jsonKey: string;

	getSROMSources: (
		rootDir: string,
		jsonSpec: Record<string, unknown>
	) => SROMTileSource[][][];

	setSROMPositions?: (sourceSROMs: SROMTile[][][]) => void;

	getSROMSourceFiles?: () => FileToWrite[];
};
