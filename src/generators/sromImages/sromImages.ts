import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { ISROMGenerator, SROMTile } from '../../api/srom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { CodeEmit, FileToWrite, Json } from '../../types';

type SromImageInput = {
	name: string;
	imageFile: string;
};

type SromImagesJsonSpec = {
	inputs: SromImageInput[];
	codeEmit?: CodeEmit[];
};

type CodeEmitTile = {
	index: number;
	paletteIndex: number;
};

type CodeEmitImage = {
	name: string;
	imageFile: string;
	tiles: CodeEmitTile[][];
};

function toCodeEmitTiles(inputTiles: SROMTile[][]): CodeEmitTile[][] {
	return inputTiles.map((inputRow) => {
		return inputRow.map((inputTile) => {
			return {
				index: inputTile.sromIndex!,
				paletteIndex: inputTile.paletteIndex!,
			};
		});
	});
}

function createImageDataForCodeEmit(
	inputs: SromImageInput[],
	tiles: SROMTile[][][]
): CodeEmitImage[] {
	const finalTiles = denormalizeDupes(tiles, 'sromIndex');

	return inputs.map((input, i) => {
		return {
			...input,
			tiles: toCodeEmitTiles(finalTiles[i]),
		};
	});
}

const sromImages: ISROMGenerator = {
	jsonKey: 'sromImages',

	getSROMSources(rootDir: string, inputJson: Json): SROMTile[][][] {
		const { inputs } = inputJson as SromImagesJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractSromTileSources(context);
		});
	},

	getSROMSourceFiles(rootDir: string, inputJson: Json, tiles: SROMTile[][][]) {
		const { inputs, codeEmit } = inputJson as SromImagesJsonSpec;

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

export { sromImages };
