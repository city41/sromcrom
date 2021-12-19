import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { ISROMGenerator, SROMTile, SROMTileSource } from '../../api/srom/types';
import { FileToWrite, Json } from '../../types';

type SromImageInput = {
	name: string;
	imageFile: string;
};

type CodeEmit = {
	template: string;
	dest: string;
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

		return (codeEmit ?? []).map<FileToWrite>((codeEmit) => {
			const templatePath = path.resolve(rootDir, codeEmit.template);
			const template = fs.readFileSync(templatePath).toString();

			const code = ejs.render(template, { inputs, tiles });

			return {
				path: path.resolve(rootDir, codeEmit.dest),
				contents: Buffer.from(code),
			};
		});
	},
};

export { sromImages };
