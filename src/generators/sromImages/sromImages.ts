import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { ISROMGenerator, SROMTile, SROMTileSource } from '../../api/srom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
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

		const finalTiles = denormalizeDupes(tiles, 'sromIndex');

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
