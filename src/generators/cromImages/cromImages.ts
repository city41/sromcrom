import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { ICROMGenerator, CROMTile, CROMTileSource } from '../../api/crom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { CodeEmit, FileToWrite, Json } from '../../types';

type CromImageInput = {
	name: string;
	imageFile: string;
};

type CromImagesJsonSpec = {
	inputs: CromImageInput[];
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
				paletteIndex: inputTile.paletteIndex,
			};
		});
	});
}

function createImageDataForCodeEmit(
	inputs: CromImageInput[],
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

const cromImages: ICROMGenerator = {
	jsonKey: 'cromImages',

	getCROMSources(rootDir: string, inputJson: Json): CROMTileSource[][][] {
		const { inputs } = inputJson as CromImagesJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractCromTileSources(context);
		});
	},

	getCROMSourceFiles(rootDir: string, inputJson: Json, tiles: CROMTile[][][]) {
		const { inputs, codeEmit } = inputJson as CromImagesJsonSpec;

		const images = createImageDataForCodeEmit(inputs, tiles);

		return (codeEmit ?? []).map<FileToWrite>((codeEmit) => {
			const templatePath = path.resolve(rootDir, codeEmit.template);
			const template = fs.readFileSync(templatePath).toString();

			const code = ejs.render(template, { images });

			return {
				path: path.resolve(rootDir, codeEmit.dest),
				contents: Buffer.from(code),
			};
		});
	},
};

export { cromImages };
