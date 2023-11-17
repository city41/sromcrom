import { Palette16Bit } from '../../api/palette/types';
import { BLACK_PALETTE } from '../../api/palette/blackPalette';
import { FileToWrite, JsonInput } from '../../types';
import { emit } from '../../emit/emit';

function orchestrate(
	rootDir: string,
	input: JsonInput,
	palettesToEmit: Palette16Bit[]
): { filesToWrite: FileToWrite[] } {
	const finalPalettes = [BLACK_PALETTE].concat(palettesToEmit);

	if (!input.palettes) {
		return { filesToWrite: [] };
	}

	const { codeEmit } = input.palettes;

	const filesToWrite = emit(rootDir, codeEmit, { palettes: finalPalettes });

	return { filesToWrite };
}

export { orchestrate };
