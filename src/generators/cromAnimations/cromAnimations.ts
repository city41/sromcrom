import path from 'path';
import { CROM_TILE_SIZE_PX } from '../../api/crom/constants';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { CROMTile, ICROMGenerator } from '../../api/crom/types';

type CromAnimation = {
	name: string;
	imageFile: string;
	tileWidth?: number;
	autoAnimation?: 4 | 8;
	// TODO: are these needed in sromcrom?
	// should sromcrom allow passing through a generic property bag?
	offsetX: number;
	offsetY: number;
	loop: boolean;
	durations?: number | number[];
};

type CromAnimationInput = {
	name: string;
	animations: CromAnimation[];
};

type CromAnimationInputJsonSpec = {
	inputs: CromAnimationInput[];
};

function sliceOutFrame(
	tiles: CROMTile[][],
	startX: number,
	endX: number
): CROMTile[][] {
	const rows: CROMTile[][] = [];

	for (let y = 0; y < tiles.length; ++y) {
		rows.push(tiles[y].slice(startX, endX));
	}

	return rows;
}

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

const cromAnimations: ICROMGenerator = {
	jsonKey: 'cromAnimations',

	getCROMSources(rootDir, inputJson) {
		const { inputs } = inputJson as CromAnimationInputJsonSpec;

		const inputAnimations = inputs.map((input) => {
			return input.animations.reduce<CROMTile[][][]>((building, animation) => {
				const context = getCanvasContextFromImagePath(
					path.resolve(rootDir, animation.imageFile)
				);

				const allTiles = extractCromTileSources(context);

				const frames: CROMTile[][][] = [];
				const imageWidthTiles = context.canvas.width / CROM_TILE_SIZE_PX;

				for (let x = 0; x < imageWidthTiles; x += animation.tileWidth ?? 1) {
					const frame = sliceOutFrame(
						allTiles,
						x,
						x + (animation.tileWidth ?? 1)
					);
					frames.push(frame);
				}

				if (animation.autoAnimation) {
					if (frames.length !== animation.autoAnimation) {
						throw new Error(
							`cromImages: ${animation.name} (${animation.imageFile}) is an auto animation of ${animation.autoAnimation} but has ${frames.length} frames`
						);
					}

					applyChildTiles(frames[0], frames.slice(1));
				}

				return building.concat(frames);
			}, []);
		});

		return inputAnimations.flat(1);
	},
	// getCROMSources(rootDir, inputJson) {
	// 	const { inputs } = inputJson as CromAnimationInputJsonSpec;

	// 	const sourcesPerInput = (inputs ?? []).map<CROMTileSource[][][]>(
	// 		(input) => {
	// 			return input.animations.map((animation) => {
	// 				const context = getCanvasContextFromImagePath(
	// 					path.resolve(rootDir, animation.imageFile)
	// 				);

	// 				const allTiles = extractCromTileSources(context);

	// 				const frames = [];

	// 				const imageWidthInTiles = context.canvas.width / CROM_TILE_SIZE_PX;
	// 				for (
	// 					let x = 0;
	// 					x < imageWidthInTiles;
	// 					x += animation.tileWidth ?? 1
	// 				) {
	// 					frames.push(allTiles.slice(x, x + (animation.tileWidth ?? 1)));
	// 				}

	//                 if (animation.autoAnimation) {
	//                     return {
	//                         source: frames[0],

	// 			});
	// 		}
	// 	);

	// 	return sourcesPerInput.flat(1);
	// },

	// getCROMSourceFiles(rootDir, inputJson, tiles: CROMTile[][][]) {},
};

export { cromAnimations };
