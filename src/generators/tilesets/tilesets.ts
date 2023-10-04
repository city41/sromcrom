import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { CROMTileMatrix, ICROMGenerator } from '../../api/crom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { FileToWrite, TilesetInput, TilesetsJsonSpec } from '../../types';

type CodeEmitTile = {
	index: number;
	paletteIndex: number;
	autoAnimation?: 4 | 8;
};

type CodeEmitTileMatrixRow = Array<CodeEmitTile | null>;
type CodeEmitTileMatrix = CodeEmitTileMatrixRow[];

type CodeEmitImage = {
	name: string;
	imageFile: string;
	tiles: CodeEmitTileMatrix;
};

function toCodeEmitTiles(inputTiles: CROMTileMatrix): CodeEmitTileMatrix {
	return inputTiles.map((inputRow) => {
		return inputRow.map((inputTile) => {
			if (inputTile === null) {
				return null;
			}

			return {
				index: inputTile.cromIndex!,
				paletteIndex: inputTile.paletteIndex!,
			};
		});
	});
}

function createTilesetDataForCodeEmit(
	inputs: TilesetInput[],
	tiles: CROMTileMatrix[]
): CodeEmitImage[] {
	const finalTiles = denormalizeDupes(tiles, 'cromIndex');

	return inputs.map((input, i) => {
		return {
			...input,
			tiles: toCodeEmitTiles(finalTiles[i]),
		};
	});
}

const tilesets: ICROMGenerator<TilesetsJsonSpec> = {
	jsonKey: 'tilesets',
	getCROMSources(rootDir, input) {
		const { inputs } = input;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractCromTileSources(context);
		});
	},
	getCROMSourceFiles(rootDir, input, tiles) {
		const { inputs, codeEmit } = input;

		if (!codeEmit) {
			return [];
		}

		const { preEmit, inputs: codeEmits } = codeEmit;

		const tilesets = createTilesetDataForCodeEmit(inputs, tiles);

		let renderData: Record<string, unknown>;

		if (preEmit) {
			const preEmitPath = path.resolve(rootDir, preEmit);
			const preEmitModule = require(preEmitPath);
			renderData = preEmitModule(rootDir, tilesets);
		} else {
			renderData = { tilesets };
		}

		return (codeEmits ?? []).map<FileToWrite>((codeEmit) => {
			const templatePath = path.resolve(rootDir, codeEmit.template);
			const template = fs.readFileSync(templatePath).toString();

			const code = ejs.render(template, renderData);

			return {
				path: path.resolve(rootDir, codeEmit.dest),
				contents: Buffer.from(code),
			};
		});
	},
};

export { tilesets };
