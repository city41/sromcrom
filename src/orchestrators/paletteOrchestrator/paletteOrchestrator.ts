import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { Palette16Bit } from '../../api/palette/types';
import { BLACK_PALETTE } from '../../api/palette/blackPalette';
import { FileToWrite, JsonInput } from '../../types';

function orchestrate(
	rootDir: string,
	input: JsonInput,
	palettes: Palette16Bit[]
): { filesToWrite: FileToWrite[] } {
	const finalPalettes = [BLACK_PALETTE].concat(palettes);

	if (!input.palettes) {
		return { filesToWrite: [] };
	}

	const { codeEmit } = input.palettes;

	const filesToWrite = (codeEmit?.inputs ?? []).map<FileToWrite>((codeEmit) => {
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
