#!/usr/bin/env node

import path from 'path';
import { Command, OptionValues } from 'commander';
import { orchestrate as cromOrchestrate } from './orchestrators/cromOrchestrator';
import { orchestrate as sromOrchestrate } from './orchestrators/sromOrchestrator';
import { writeFiles } from './writeFiles';
import { validateInputJson } from './validateInputJson';
import { BLACK_PALETTE } from './api/palette/blackPalette';
import { emit } from './emit/emit';

import type { CodeEmitData, HookModule } from './types';
import type { Palette16Bit } from './api/palette/types';
export type { CodeEmitData };

const dummyHook: Required<HookModule> = {
	init(_rootDir) {
		return Promise.resolve();
	},
	overrideInputData(_rootDir, input) {
		return Promise.resolve(input);
	},
	overrideEmitData(_rootDir, emitData) {
		return Promise.resolve(emitData);
	},
	cleanup(_rootDir) {
		return Promise.resolve();
	},
};

async function main(options: OptionValues) {
	// read JSON file
	const inputJsonPath = path.resolve(process.cwd(), options.input);
	const inputResourceJson = require(inputJsonPath) as unknown;

	if (!validateInputJson(inputResourceJson)) {
		process.exit(1);
	}

	const rootDir = path.dirname(inputJsonPath);

	let hookModule: Required<HookModule> = dummyHook;
	if (inputResourceJson.hookScript) {
		const hookScriptPath = path.resolve(rootDir, inputResourceJson.hookScript);
		const hookModuleRequire = require(hookScriptPath);
		// the module may be commonjs or esm
		const inputHookModule = (hookModuleRequire.default ??
			hookModuleRequire) as HookModule;

		hookModule = {
			...dummyHook,
			...inputHookModule,
		};

		await hookModule.init(rootDir);
	}

	const resourceJson = await hookModule.overrideInputData(
		rootDir,
		inputResourceJson
	);

	if (!validateInputJson(resourceJson)) {
		console.error('After hook.overrideInputData, the input is no longer valid');
		process.exit(1);
	}

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
		const preCodeEmitData: CodeEmitData = {
			...sromOrchestrateResult.codeEmitData,
			...cromOrchestrateResult.codeEmitData,
			palettes: finalPalettes,
		};

		const codeEmitData = await hookModule.overrideEmitData(
			rootDir,
			preCodeEmitData
		);

		const codeEmitFilesToWrite = await emit(
			rootDir,
			resourceJson.codeEmit,
			codeEmitData
		);
		filesToWrite.push(...codeEmitFilesToWrite);
	}
	writeFiles(filesToWrite);

	await hookModule.cleanup(rootDir);
}

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
} else {
	main(options)
		.then(() => {
			console.log('sromcrom finished');
		})
		.catch((e) => {
			console.error('unexpected error', e);
		});
}
