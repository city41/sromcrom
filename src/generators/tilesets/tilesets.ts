import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractCromTileSources } from '../../api/crom/extractCromTileSources';
import { ICROMGenerator } from '../../api/crom/types';
import { denormalizeDupes } from '../../api/tile/denormalizeDupes';
import { CodeEmit, FileToWrite } from '../../types';

type TilesetInput = {
	name: string;
	imageFile: string;
};

type TilesetsJsonSpec = {
	inputs: TilesetInput[];
	codeEmit?: CodeEmit[];
};

const tilesets: ICROMGenerator = {
	jsonKey: 'tilesets',
	getCROMSources(rootDir, json) {
		const { inputs } = json as TilesetsJsonSpec;

		return inputs.map((input) => {
			const context = getCanvasContextFromImagePath(
				path.resolve(rootDir, input.imageFile)
			);

			return extractCromTileSources(context);
		});
	},
	getCROMSourceFiles(rootDir, inputJson, tiles) {
		const { inputs, codeEmit } = inputJson as TilesetsJsonSpec;

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

export { tilesets };
