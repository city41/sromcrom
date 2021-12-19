import path from 'path';
import { getCanvasContextFromImagePath } from '../../api/canvas';
import { extractSromTileSources } from '../../api/srom/extractSromTileSources';
import { ISROMGenerator, SROMTile, SROMTileSource } from '../../api/srom/types';
import { Json } from '../../types';

type SromImageInput = {
	name: string;
	imageFile: string;
};

type SromImagesJsonSpec = {
	inputs: SromImageInput[];
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
		return [];
	},
};

export { sromImages };
