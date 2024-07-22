#!/usr/bin/env node

import path from 'path';
import { Command } from 'commander';
import { orchestrate as cromOrchestrate } from './orchestrators/cromOrchestrator';
import { orchestrate as sromOrchestrate } from './orchestrators/sromOrchestrator';
import { writeFiles } from './writeFiles';
import { validateInputJson } from './validateInputJson';
import { BLACK_PALETTE } from './api/palette/blackPalette';
import { emit } from './emit/emit';

import type { CodeEmitData } from './types';
import type { Palette16Bit } from './api/palette/types';
export type { CodeEmitData };

const packageJson = require('../package.json');

const program = new Command();

program
	.version(packageJson.version)
	.option(
		'-i, --input <JSON specification file>',
		'The JSON file specifying everything for input'
	)
	.parse(process.argv);

const options = program.opts();

if (!options.input) {
	program.help();
}

// read JSON file
const inputJsonPath = path.resolve(process.cwd(), options.input);
const resourceJson = require(inputJsonPath) as unknown;

if (!validateInputJson(resourceJson)) {
	process.exit(1);
}

const rootDir = path.dirname(inputJsonPath);

// start at palette index 1 to allow palette 0 to be the black palette
const sromOrchestrateResult = sromOrchestrate(rootDir, resourceJson, 1);
const cromOrchestrateResult = cromOrchestrate(
	rootDir,
	resourceJson,
	1 + sromOrchestrateResult.palettesToEmit.length
);

const sromAndCromPalettesToEmit: Palette16Bit[] =
	sromOrchestrateResult.palettesToEmit.concat(
		cromOrchestrateResult.palettesToEmit
	);

const finalPalettes = ([BLACK_PALETTE] as Palette16Bit[]).concat(
	sromAndCromPalettesToEmit
);

const filesToWrite = cromOrchestrateResult.filesToWrite.concat(
	sromOrchestrateResult.filesToWrite
);

if (resourceJson.codeEmit) {
	const codeEmitData: CodeEmitData = {
		...sromOrchestrateResult.codeEmitData,
		...cromOrchestrateResult.codeEmitData,
		palettes: finalPalettes,
	};

	emit(rootDir, resourceJson.codeEmit, codeEmitData).then(
		(codeEmitFilesToWrite) => {
			filesToWrite.push(...codeEmitFilesToWrite);
			writeFiles(filesToWrite);
		}
	);
} else {
	writeFiles(filesToWrite);
}
