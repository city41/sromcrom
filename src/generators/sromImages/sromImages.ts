import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { ISROMGenerator, SROMTile, SROMTileSource } from '../../api/srom/types';
import { CodeEmit, FileToWrite, Json } from '../../types';
import cloneDeep from 'lodash/cloneDeep';

type SromImageInput = {
	name: string;
	imageFile: string;
};

type SromImagesJsonSpec = {
	inputs: SromImageInput[];
	codeEmit?: CodeEmit[];
};

/**
 * If a tile is a dupe, it won't have a sromIndex but instead
 * it will point to what it duplicates. This makes writing tiles
 * during codeEmit more painful. This function takes duped tiles
 * and gives them the same sromIndex as who they are duplicating.
 * Then codeEmit only needs to work with sromIndex and not care
 * about duplicates at all.
 */
function denormalizeDupes(tiles: SROMTile[][][]): SROMTile[][][] {
	const cloned = cloneDeep(tiles);

	cloned.forEach((image) => {
		image.forEach((row) => {
			row.forEach((tile) => {
				if (tile.duplicateOf) {
					tile.sromIndex = tile.duplicateOf.sromIndex;
				}
			});
		});
	});

	return cloned;
}

const sromImages: ISROMGenerator = {
	jsonKey: 'sromImages',

	getSROMSources(rootDir: string, inputJson: Json): SROMTileSource[][][] {
		const { inputs } = inputJson as SromImagesJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractSromTileSources(context);
		});
	},

	getSROMSourceFiles(rootDir: string, inputJson: Json, tiles: SROMTile[][][]) {
		const { inputs, codeEmit } = inputJson as SromImagesJsonSpec;

		const finalTiles = denormalizeDupes(tiles);

		return (codeEmit ?? []).map<FileToWrite>((codeEmit) => {
			const templatePath = path.resolve(rootDir, codeEmit.template);
			const template = fs.readFileSync(templatePath).toString();

			const code = ejs.render(template, { inputs, tiles: finalTiles });

			return {
				path: path.resolve(rootDir, codeEmit.dest),
				contents: Buffer.from(code),
			};
		});
	},
};

export { sromImages };
