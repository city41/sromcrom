import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { ISROMGenerator, SROMTile, SROMTileMatrix } from '../../api/srom/types';
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

type CodeEmitTileMatrixRow = Array<CodeEmitTile | null>;
type CodeEmitTileMatrix = CodeEmitTileMatrixRow[];

type CodeEmitImage = {
	name: string;
	imageFile: string;
	tiles: CodeEmitTileMatrix;
};

function toCodeEmitTiles(inputTiles: SROMTileMatrix): CodeEmitTileMatrix {
	return inputTiles.map((inputRow) => {
		return inputRow.map((inputTile) => {
			if (inputTile === null) {
				return null;
			}

			return {
				index: inputTile.sromIndex!,
				paletteIndex: inputTile.paletteIndex!,
			};
		});
	});
}

function createImageDataForCodeEmit(
	inputs: SromImageInput[],
	tiles: SROMTileMatrix[]
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

	getSROMSources(rootDir, inputJson) {
		const { inputs } = inputJson as SromImagesJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractSromTileSources(context);
		});
	},

	getSROMSourceFiles(rootDir, inputJson, tiles) {
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
