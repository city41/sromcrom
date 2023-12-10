import path from 'path';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { ICROMGenerator, CROMTile, CROMTileMatrix } from '../../api/crom/types';
import { CROM_TILE_SIZE_PX } from '../..//api/crom/constants';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { sliceOutFrame } from '../../api/tile/sliceOutFrame';
import { CromImageInput, CromImagesInputJsonSpec } from '../../types';
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
	custom: Record<string, unknown>;
};

function applyChildTiles(
	masterFrame: CROMTile[][],
	childFrames: CROMTile[][][]
) {
	for (let f = 0; f < childFrames.length; ++f) {
		for (let y = 0; y < childFrames[f].length; ++y) {
			for (let x = 0; x < childFrames[f][y].length; ++x) {
				// @ts-expect-error it wants this array to already be 3 or 7 in size
				masterFrame[y][x].childAnimationFrames ??= [];
				masterFrame[y][x].childAnimationFrames!.push(childFrames[f][y][x]);
				childFrames[f][y][x].childOf = masterFrame[y][x];
			}
		}
	}
}

function toCodeEmitTiles(
	input: CromImageInput,
	inputTiles: CROMTileMatrix
): CodeEmitTileMatrix {
	// if this crom image is an auto animation, then the inputTiles has all the frames of the animation,
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

			return {
				index: inputTile.cromIndex!,
				paletteIndex: inputTile.paletteIndex!,
			};
		});
	});
}

function getCustomPropObject(input: CromImageInput): Record<string, unknown> {
	const { name, imageFile, tileWidth, autoAnimation, ...custom } = input;
	return custom;
}

function createImageDataForCodeEmit(
	inputs: CromImageInput[],
	tiles: CROMTileMatrix[]
): CodeEmitImage[] {
	const finalTiles = denormalizeDupes(tiles, 'cromIndex');

	return inputs.map((input, i) => {
		return {
			...input,
			tiles: toCodeEmitTiles(input, finalTiles[i]),
			custom: getCustomPropObject(input),
		};
	});
}

const cromImages: ICROMGenerator<CromImagesInputJsonSpec> = {
	jsonKey: 'cromImages',

	getCROMSources(rootDir, input) {
		const { inputs } = input;

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
						`cromImages: ${input.name} (${input.imageFile}) is an auto animation of ${input.autoAnimation} but its tile width is not a multiple of that`
					);
				}

				if (allTiles.some((f) => f === null)) {
					throw new Error(
						`cromAnimations: ${input.name} (${input.imageFile}) is an auto animation of ${input.autoAnimation} but has blank frames. If a frame should be empty, use magenta instead of alpha=0`
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

	getCROMSourceFiles(rootDir, input, tiles) {
		const { inputs, codeEmit } = input;

		const images = createImageDataForCodeEmit(inputs, tiles);

		return emit(rootDir, codeEmit, { images });
	},
};

export { cromImages };
