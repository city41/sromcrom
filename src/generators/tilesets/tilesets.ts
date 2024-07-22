import path from 'path';
import { Canvas } from 'canvas';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { CROMTile, CROMTileMatrix, ICROMGenerator } from '../../api/crom/types';
import { CROM_TILE_SIZE_PX } from '../../api/crom/constants';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { sliceOutFrame } from '../../api/tile/sliceOutFrame';
import { TilesetInput, TilesetsJsonSpec } from '../../types';

type CodeEmitTile = {
	index: number;
	paletteIndex: number;
	autoAnimation?: 4 | 8;
	canvasSource: Canvas;
};

type CodeEmitTileMatrixRow = Array<CodeEmitTile | null>;
type CodeEmitTileMatrix = CodeEmitTileMatrixRow[];

export type CodeEmitTileset = {
	name: string;
	imageFile: string;
	tiles: CodeEmitTileMatrix;
};

function applyChildTiles(
	masterFrame: CROMTile[][],
	childFrames: CROMTile[][][]
) {
	for (let y = 0; y < masterFrame.length; ++y) {
		for (let x = 0; x < masterFrame[y].length; ++x) {
			// if they are all the same, no need to make this an autoAnimation
			const allFrameTilessAreEqual = childFrames.every((cf) => {
				return (
					cf[y][x].canvasSource.toDataURL() ===
					masterFrame[y][x].canvasSource.toDataURL()
				);
			});
			if (!allFrameTilessAreEqual) {
				for (let f = 0; f < childFrames.length; ++f) {
					// @ts-expect-error it wants this array to already be 3 or 7 in size
					masterFrame[y][x].childAnimationFrames ??= [];
					masterFrame[y][x].childAnimationFrames!.push(childFrames[f][y][x]);
					childFrames[f][y][x].childOf = masterFrame[y][x];
				}
			}
		}
	}
}

function toCodeEmitTiles(
	input: TilesetInput,
	inputTiles: CROMTileMatrix
): CodeEmitTileMatrix {
	// if this tileset is an auto animation, then the inputTiles has all the frames of the animation,
	// but for code emit, we want to treat it just like an image, so just slice out the first frame
	// and ignore the others. They got emitted into the crom properly
	if (input.autoAnimation) {
		const canvasWidthInTiles = inputTiles[0].length;
		const frameWidthInTiles = canvasWidthInTiles / input.autoAnimation;
		inputTiles = sliceOutFrame(inputTiles, 0, frameWidthInTiles);
	}

	return inputTiles.map((inputRow) => {
		return inputRow.map((inputTile) => {
			if (inputTile === null) {
				return null;
			}

			const childFrameCount = inputTile.childAnimationFrames?.length;

			const autoAnimation = (childFrameCount && childFrameCount + 1) as
				| 4
				| 8
				| undefined;

			return {
				index: inputTile.cromIndex!,
				paletteIndex: inputTile.paletteIndex!,
				autoAnimation,
				canvasSource: inputTile.canvasSource,
			};
		});
	});
}

function createTilesetDataForCodeEmit(
	inputs: TilesetInput[],
	tiles: CROMTileMatrix[]
): CodeEmitTileset[] {
	const finalTiles = denormalizeDupes(tiles, 'cromIndex');

	return inputs.map((input, i) => {
		return {
			...input,
			tiles: toCodeEmitTiles(input, finalTiles[i]),
		};
	});
}

const tilesets: ICROMGenerator<TilesetsJsonSpec, CodeEmitTileset[]> = {
	jsonKey: 'tilesets',
	getCROMSources(rootDir, inputs) {
		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			const allTiles = extractCromTileSources(context);

			if (input.autoAnimation) {
				const canvasWidthInTiles = context.canvas.width / CROM_TILE_SIZE_PX;
				const frameWidthInTiles = canvasWidthInTiles / input.autoAnimation;
				const leftoverTiles = canvasWidthInTiles % input.autoAnimation;

				if (leftoverTiles !== 0) {
					throw new Error(
						`tilesets: ${input.name} (${input.imageFile}) is an auto animation of ${input.autoAnimation} but its tile width is not a multiple of that`
					);
				}

				const frames: CROMTileMatrix[] = [];

				for (let x = 0; x < canvasWidthInTiles; x += frameWidthInTiles) {
					const frame = sliceOutFrame(allTiles, x, x + frameWidthInTiles);
					frames.push(frame);
				}

				applyChildTiles(
					frames[0] as CROMTile[][],
					frames.slice(1) as CROMTile[][][]
				);
			}

			return allTiles;
		});
	},

	getCodeEmitData(_rootDir, inputs, tiles) {
		return createTilesetDataForCodeEmit(inputs, tiles);
	},
};

export { tilesets };
