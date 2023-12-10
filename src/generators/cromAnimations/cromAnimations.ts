import path from 'path';
import { CROM_TILE_SIZE_PX } from '../../api/crom/constants';
import { getCanvasContextFromImagePath } from '../../api/canvas/getCanvasContextFromImagePath';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { CROMTile, CROMTileMatrix, ICROMGenerator } from '../../api/crom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { sliceOutFrame } from '../../api/tile/sliceOutFrame';
import {
	CromAnimation,
	CromAnimationInput,
	CromAnimationsInputJsonSpec,
} from '../../types';
import { emit } from '../../emit/emit';

type CodeEmitTile = {
	index: number;
	paletteIndex: number;
};

type CodeEmitTileMatrixRow = CodeEmitTile[];
type CodeEmitTileMatrix = CodeEmitTileMatrixRow[];

type CodeEmitAnimation = {
	name: string;
	imageFile: string;
	duration?: number | null;
	frames: CodeEmitTileMatrix[];
	custom: Record<string, unknown>;
};

type CodeEmitAnimationGroup = {
	name: string;
	animations: CodeEmitAnimation[];
};

function toCodeEmitTiles(inputTiles: CROMTileMatrix): CodeEmitTileMatrix {
	return inputTiles.map((inputRow) => {
		return inputRow.map((inputTile) => {
			if (inputTile.cromIndex === undefined) {
				throw new Error(
					`toCodeEmitTiles: this tile is unpositioned, (dupe? ${!!inputTile.duplicateOf}, dupe index: ${
						(inputTile.duplicateOf as CROMTile)?.cromIndex ?? 'none'
					}`
				);
			}

			return {
				index: inputTile.cromIndex!,
				paletteIndex: inputTile.paletteIndex!,
			};
		});
	});
}

function getNumberOfFrames(rootDir: string, animation: CromAnimation): number {
	// TODO: figure out how to do this without dipping back into the canvas
	const context = getCanvasContextFromImagePath(
		path.resolve(rootDir, animation.imageFile)
	);

	return context.canvas.width / CROM_TILE_SIZE_PX / (animation.tileWidth ?? 1);
}

function getCustomPropObject(
	animation: CromAnimation
): Record<string, unknown> {
	const { name, imageFile, tileWidth, ...custom } = animation;
	return custom;
}

function toCodeEmitAnimations(
	rootDir: string,
	animations: CromAnimation[],
	inputTiles: CROMTileMatrix[]
): CodeEmitAnimation[] {
	return animations.map((animation) => {
		const numFrames = getNumberOfFrames(rootDir, animation);
		const frames = inputTiles.splice(0, numFrames);

		return {
			name: animation.name,
			imageFile: animation.imageFile,
			duration: animation.duration,
			frames: frames.map(toCodeEmitTiles),
			custom: getCustomPropObject(animation),
		};
	});
}

function getMaxWidth(animations: CromAnimation[]): number {
	return Math.max(...animations.map((a) => a.tileWidth ?? 1));
}

function createAnimationDataForCodeEmit(
	rootDir: string,
	inputs: CromAnimationInput[],
	tiles: CROMTileMatrix[]
): CodeEmitAnimationGroup[] {
	const finalTiles = denormalizeDupes(tiles, 'cromIndex');

	let sliceIndex = 0;
	return inputs.map((input) => {
		const totalFrames = input.animations.reduce<number>(
			(building, animation) => {
				return building + getNumberOfFrames(rootDir, animation);
			},
			0
		);

		const animationSlice = finalTiles.slice(
			sliceIndex,
			sliceIndex + totalFrames
		);
		sliceIndex += animationSlice.length;

		return {
			name: input.name,
			maxWidth: getMaxWidth(input.animations),
			animations: toCodeEmitAnimations(
				rootDir,
				input.animations,
				animationSlice
			),
		};
	});
}

const cromAnimations: ICROMGenerator<CromAnimationsInputJsonSpec> = {
	jsonKey: 'cromAnimations',

	getCROMSources(rootDir, input) {
		const { inputs } = input;

		const inputAnimations = inputs.map((input) => {
			return input.animations.reduce<CROMTileMatrix[]>(
				(building, animation) => {
					const context = getCanvasContextFromImagePath(
						path.resolve(rootDir, animation.imageFile)
					);

					const allTiles = extractCromTileSources(context);

					const frames: CROMTileMatrix[] = [];
					const imageWidthTiles = context.canvas.width / CROM_TILE_SIZE_PX;

					for (let x = 0; x < imageWidthTiles; x += animation.tileWidth ?? 1) {
						const frame = sliceOutFrame(
							allTiles,
							x,
							x + (animation.tileWidth ?? 1)
						);
						frames.push(frame);
					}

					return building.concat(frames);
				},
				[]
			);
		});

		return inputAnimations.flat(1);
	},

	getCROMSourceFiles(rootDir, input, tiles) {
		const { inputs, codeEmit } = input;

		const animationGroups = createAnimationDataForCodeEmit(
			rootDir,
			inputs,
			tiles
		);

		return emit(rootDir, codeEmit, { animationGroups });
	},
};

export { cromAnimations };
