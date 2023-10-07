import path from 'path';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { ISROMGenerator, SROMTileMatrix } from '../../api/srom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { SromImageInput, SromImagesJsonSpec } from '../../types';
import { emit } from '../../emit/emit';

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

const sromImages: ISROMGenerator<SromImagesJsonSpec> = {
	jsonKey: 'sromImages',

	getSROMSources(rootDir, input) {
		const { inputs } = input;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractSromTileSources(context);
		});
	},

	getSROMSourceFiles(rootDir, input, tiles) {
		const { inputs, codeEmit } = input;

		const images = createImageDataForCodeEmit(inputs, tiles);

		return emit(rootDir, codeEmit, { images });
	},
};

export { sromImages };
