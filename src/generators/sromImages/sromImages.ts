import path from 'path';
import { Canvas } from 'canvas';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import {
	ISROMGenerator,
	SROMSourceResult,
	SROMTileMatrix,
} from '../../api/srom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { SromImageInput, SromImagesJsonSpec } from '../../types';

type CodeEmitTile = {
	index: number;
	paletteIndex: number;
	canvasSource: Canvas;
};

type CodeEmitTileMatrixRow = CodeEmitTile[];
type CodeEmitTileMatrix = CodeEmitTileMatrixRow[];

export type CodeEmitSromImage = {
	name: string;
	imageFile: string;
	tiles: CodeEmitTileMatrix;
};

function toCodeEmitTiles(inputTiles: SROMTileMatrix): CodeEmitTileMatrix {
	return inputTiles.map((inputRow) => {
		return inputRow.map((inputTile) => {
			return {
				index: inputTile.sromIndex!,
				paletteIndex: inputTile.paletteIndex!,
				canvasSource: inputTile.canvasSource,
			};
		});
	});
}

function createImageDataForCodeEmit(
	sromSourceResults: SROMSourceResult<SromImageInput>[]
): CodeEmitSromImage[] {
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

const sromImages: ISROMGenerator<
	SromImagesJsonSpec,
	SromImageInput,
	CodeEmitSromImage[]
> = {
	jsonKey: 'sromImages',

	getSROMSources(rootDir, inputs) {
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

	getCodeEmitData(_rootDir, _input, sromSourceResults) {
		return createImageDataForCodeEmit(sromSourceResults);
	},
};

export { sromImages };
