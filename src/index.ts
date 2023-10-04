#!/usr/bin/env node

import path from 'path';
import { Command } from 'commander';
import { orchestrate as cromOrchestrate } from './orchestrators/cromOrchestrator';
import { orchestrate as sromOrchestrate } from './orchestrators/sromOrchestrator';
import { orchestrate as paletteOrchestrate } from './orchestrators/paletteOrchestrator';
import { writeFiles } from './writeFiles';
import { Palette16Bit } from './api/palette/types';
import { validateInputJson } from './validateInputJson';

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
	1 + sromOrchestrateResult.palettes.length
);

const sromAndCromPalettes: Palette16Bit[] =
	sromOrchestrateResult.palettes.concat(cromOrchestrateResult.palettes);

const paletteOrchestrateResult = paletteOrchestrate(
	rootDir,
	resourceJson,
	sromAndCromPalettes
);

writeFiles(
	cromOrchestrateResult.filesToWrite.concat(
		sromOrchestrateResult.filesToWrite,
		paletteOrchestrateResult.filesToWrite
	)
);
