import path from 'path';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { CROMTileMatrix, ICROMGenerator } from '../../api/crom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { TilesetInput, TilesetsJsonSpec } from '../../types';
import { emit } from '../../emit/emit';

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

		const { preEmit } = codeEmit;

		const tilesets = createTilesetDataForCodeEmit(inputs, tiles);

		let renderData: Record<string, unknown>;

		if (preEmit) {
			const preEmitPath = path.resolve(rootDir, preEmit);
			const preEmitModule = require(preEmitPath);
			// the module may be commonjs or esm
			const preEmitFn = preEmitModule.default ?? preEmitModule;
			renderData = preEmitFn(rootDir, tilesets);
		} else {
			renderData = { tilesets };
		}

		return emit(rootDir, codeEmit, renderData);
	},
};

export { tilesets };
