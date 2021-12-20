import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { Palette16Bit } from '../../api/palette/types';
import { BLACK_PALETTE } from '../../api/palette/blackPalette';
import { CodeEmit, FileToWrite, Json } from '../../types';

type PaletteCodeEmitSpec = {
	codeEmit?: CodeEmit[];
};

function orchestrate(
	rootDir: string,
	resourceJson: Json,
	palettes: Palette16Bit[]
): { filesToWrite: FileToWrite[] } {
	const finalPalettes = [BLACK_PALETTE].concat(palettes);

	const { codeEmit } = resourceJson.paletteCodeEmit as PaletteCodeEmitSpec;

	const filesToWrite = (codeEmit ?? []).map<FileToWrite>((codeEmit) => {
		const templatePath = path.resolve(rootDir, codeEmit.template);
		const template = fs.readFileSync(templatePath).toString();

		const code = ejs.render(template, { palettes: finalPalettes });

		return {
			path: path.resolve(rootDir, codeEmit.dest),
			contents: Buffer.from(code),
		};
	});

	return { filesToWrite };
}

export { orchestrate };
