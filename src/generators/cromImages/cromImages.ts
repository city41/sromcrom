import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { ICROMGenerator, CROMTile, CROMTileSource } from '../../api/crom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { CodeEmit, FileToWrite, Json } from '../../types';

type CromImageInput = {
	name: string;
	imageFile: string;
};

type CromImagesJsonSpec = {
	inputs: CromImageInput[];
	codeEmit?: CodeEmit[];
};

const cromImages: ICROMGenerator = {
	jsonKey: 'cromImages',

	getCROMSources(rootDir: string, inputJson: Json): CROMTileSource[][][] {
		const { inputs } = inputJson as CromImagesJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractCromTileSources(context);
		});
	},

	getCROMSourceFiles(rootDir: string, inputJson: Json, tiles: CROMTile[][][]) {
		const { inputs, codeEmit } = inputJson as CromImagesJsonSpec;

		const finalTiles = denormalizeDupes(tiles, 'cromIndex');

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

export { cromImages };
