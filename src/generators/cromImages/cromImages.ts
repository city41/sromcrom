import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { ICROMGenerator, CROMTile, CROMTileMatrix } from '../../api/crom/types';
import { CROM_TILE_SIZE_PX } from '../..//api/crom/constants';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { sliceOutFrame } from '../../api/tile/sliceOutFrame';
import { CodeEmit, FileToWrite, Json } from '../../types';

type CromImageInput = {
	name: string;
	imageFile: string;
	tileWidth?: number;
	autoAnimation?: number;
	[key: string]: unknown;
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
				// @ts-ignore it wants this array to already be 3 or 7 in size
				masterFrame[y][x].childAnimationFrames ??= [];
				masterFrame[y][x].childAnimationFrames!.push(childFrames[f][y][x]);
				childFrames[f][y][x].childOf = masterFrame[y][x];
			}
		}
	}
}

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

function getCustomPropObject(
	input: CromImageInput
): Record<string, unknown> {
	const { name, imageFile, tileWidth, ...custom } = input;
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
			tiles: toCodeEmitTiles(finalTiles[i]),
			custom: getCustomPropObject(input)
		};
	});
}

const cromImages: ICROMGenerator = {
	jsonKey: 'cromImages',

	getCROMSources(rootDir: string, inputJson: Json) {
		const { inputs } = inputJson as CromImagesJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			const allTiles = extractCromTileSources(context);

			if (input.autoAnimation) {
				const tileWidth = input.tileWidth ?? 1;
				const canvasWidthInTiles = context.canvas.width / CROM_TILE_SIZE_PX;
				const frameCount = canvasWidthInTiles / tileWidth;

				if (frameCount !== input.autoAnimation) {
					throw new Error(
						`cromImages: ${input.name} (${input.imageFile}) is an auto animation of ${input.autoAnimation} but has ${frameCount} frames`
					);
				}

				if (allTiles.some((f) => f === null)) {
					throw new Error(
						`cromAnimations: ${input.name} (${input.imageFile}) is an auto animation of ${input.autoAnimation} but has blank frames. If a frame should be empty, use magenta instead of alpha=0`
					);
				}

				const frames: CROMTileMatrix[] = [];

				for (let x = 0; x < canvasWidthInTiles; x += tileWidth) {
					const frame = sliceOutFrame(allTiles, x, x + tileWidth);
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

	getCROMSourceFiles(rootDir: string, inputJson: Json, tiles) {
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
