#!/usr/bin/env node

import path from 'path';
import { Command } from 'commander';
import { orchestrate as cromOrchestrate } from './cromOrchestrator';
import { orchestrate as sromOrchestrate } from './sromOrchestrator';
import { writeFiles } from './writeFiles';

const packageJson = require('../../package.json');

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
const inputJsonPath = path.join(process.cwd(), options.input);
const resourceJson = require(inputJsonPath);

const rootDir = process.cwd();
const sromOrchestrateResult = sromOrchestrate(rootDir, resourceJson);
const cromOrchestrateResult = cromOrchestrate(rootDir, resourceJson);

writeFiles(
	cromOrchestrateResult.filesToWrite.concat(sromOrchestrateResult.filesToWrite)
);
