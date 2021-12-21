import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { CROMTile, ICROMGenerator } from '../../api/crom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { CodeEmit, FileToWrite } from '../../types';

type TilesetInput = {
	name: string;
	imageFile: string;
};

type TilesetsJsonSpec = {
	inputs: TilesetInput[];
	codeEmit?: CodeEmit[];
};

type CodeEmitTile = {
	index: number;
	paletteIndex: number;
	autoAnimation?: 4 | 8;
};

type CodeEmitImage = {
	name: string;
	imageFile: string;
	tiles: CodeEmitTile[][];
};

function toCodeEmitTiles(inputTiles: CROMTile[][]): CodeEmitTile[][] {
	return inputTiles.map((inputRow) => {
		return inputRow.map((inputTile) => {
			return {
				index: inputTile.cromIndex!,
				paletteIndex: inputTile.paletteIndex!,
			};
		});
	});
}

function createTilesetDataForCodeEmit(
	inputs: TilesetInput[],
	tiles: CROMTile[][][]
): CodeEmitImage[] {
	const finalTiles = denormalizeDupes(tiles, 'cromIndex');

	return inputs.map((input, i) => {
		return {
			...input,
			tiles: toCodeEmitTiles(finalTiles[i]),
		};
	});
}

const tilesets: ICROMGenerator = {
	jsonKey: 'tilesets',
	getCROMSources(rootDir, json) {
		const { inputs } = json as TilesetsJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractCromTileSources(context);
		});
	},
	getCROMSourceFiles(rootDir, inputJson, tiles) {
		const { inputs, codeEmit } = inputJson as TilesetsJsonSpec;

		const tilesets = createTilesetDataForCodeEmit(inputs, tiles);

		return (codeEmit ?? []).map<FileToWrite>((codeEmit) => {
			const templatePath = path.resolve(rootDir, codeEmit.template);
			const template = fs.readFileSync(templatePath).toString();

			const code = ejs.render(template, { tilesets });

			return {
				path: path.resolve(rootDir, codeEmit.dest),
				contents: Buffer.from(code),
			};
		});
	},
};

export { tilesets };
