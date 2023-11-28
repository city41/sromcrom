import path from 'path';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import {
	ISROMGenerator,
	SROMSourceResult,
	SROMTileMatrix,
} from '../../api/srom/types';
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
	sromSourceResults: SROMSourceResult<SromImageInput>[]
): CodeEmitImage[] {
	const finalTiles = denormalizeDupes(
		sromSourceResults.map((ssr) => ssr.tiles),
		'sromIndex'
	);

	return sromSourceResults.map((ssr, i) => {
		return {
			...ssr.input,
			tiles: toCodeEmitTiles(finalTiles[i]),
		};
	});
}

const sromImages: ISROMGenerator<SromImagesJsonSpec, SromImageInput> = {
	jsonKey: 'sromImages',

	getSROMSources(rootDir, input) {
		const { inputs } = input;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			const tiles = extractSromTileSources(context);
			return {
				tiles,
				input,
			};
		});
	},

	setSROMPositions(
		_rootDir,
		_input,
		sromSourceResults: SROMSourceResult<SromImageInput>[]
	) {
		const toBePositioned = sromSourceResults.filter(
			(ssr) => typeof ssr.input.startingIndex === 'number'
		);

		toBePositioned.forEach((ssr) => {
			let i = ssr.input.startingIndex!;
			ssr.tiles.forEach((col) => {
				col.forEach((tile) => {
					if (tile) {
						tile.sromIndex = i++;
					}
				});
			});
		});
	},

	getSROMSourceFiles(rootDir, input, sromSourceResults) {
		const { codeEmit } = input;

		const images = createImageDataForCodeEmit(sromSourceResults);

		return emit(rootDir, codeEmit, { images });
	},
};

export { sromImages };
