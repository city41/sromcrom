import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { CodeEmitData, CodeEmitJsonSpec, FileToWrite } from '../types';

function extractNumbersFromArgs(args: unknown[]) {
	const nums = [];

	let i = 0;

	while (i < args.length) {
		const rawNum = args[i];

		if (typeof rawNum === 'number') {
			nums.push(rawNum);
			i += 1;
		} else {
			if (typeof rawNum === 'string') {
				const parsed = parseInt(rawNum, 10);

				if (!isNaN(parsed)) {
					nums.push(parsed);
					i += 1;
				} else {
					break;
				}
			} else {
				break;
			}
		}
	}

	return nums;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper('default', (a: any, defaultValue: any) => {
	return a ?? defaultValue;
});

Handlebars.registerHelper('flat', (a: unknown) => {
	if (!Array.isArray(a)) {
		throw new Error(
			`flat: argument is not an array, received: ${JSON.stringify(a)}`
		);
	}

	return a.flat(Infinity);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper('count', (a: unknown, options: any) => {
	if (!Array.isArray(a)) {
		throw new Error(
			`count: argument is not an array, received: ${JSON.stringify(a)}`
		);
	}

	if (options?.hash?.flatten) {
		return a.flat(Infinity).length;
	} else {
		return a.length;
	}
});

Handlebars.registerHelper('toUpperCase', (a: unknown) => {
	if (typeof a !== 'string') {
		throw new Error(
			`toUpperCase: argument is not a string, received: ${JSON.stringify(a)}`
		);
	}

	return a.toUpperCase();
});

Handlebars.registerHelper('mul', (...rawArgs: unknown[]) => {
	const nums = extractNumbersFromArgs(rawArgs);

	if (nums.length < 2) {
		throw new Error(`mul: received ${nums.length} numbers, need at least 2`);
	}

	return nums.reduce<number>((accum, n) => {
		return accum * n;
	}, 1);
});

Handlebars.registerHelper('add', (...rawArgs: unknown[]) => {
	const nums = extractNumbersFromArgs(rawArgs);

	if (nums.length < 2) {
		throw new Error(`add: received ${nums.length} numbers, need at least 2`);
	}

	return nums.reduce<number>((accum, n) => {
		return accum + n;
	}, 0);
});

Handlebars.registerHelper('div', (a: unknown, b: unknown) => {
	const an = Number(a);
	const bn = Number(b);

	if (isNaN(an) || isNaN(bn)) {
		throw new Error(
			`div: arguments must be numbers, received: ${JSON.stringify(
				a
			)}, ${JSON.stringify(b)}`
		);
	}

	return an / bn;
});

Handlebars.registerHelper('sub', (a: unknown, b: unknown) => {
	const an = Number(a);
	const bn = Number(b);

	if (isNaN(an) || isNaN(bn)) {
		throw new Error(
			`sub: arguments must be numbers, received: ${JSON.stringify(
				a
			)}, ${JSON.stringify(b)}`
		);
	}

	return an - bn;
});

Handlebars.registerHelper('hex', (a: unknown) => {
	const an = Number(a);

	if (isNaN(an)) {
		throw new Error(
			`hex: argument should be a number, received: ${JSON.stringify(a)}`
		);
	}

	return an.toString(16);
});

Handlebars.registerHelper('oct', (a: unknown) => {
	const an = Number(a);

	if (isNaN(an)) {
		throw new Error(
			`oct: argument should be a number, received: ${JSON.stringify(a)}`
		);
	}

	return an.toString(8);
});

Handlebars.registerHelper('bin', (a: unknown) => {
	const an = Number(a);

	if (isNaN(an)) {
		throw new Error(
			`bin: argument should be a number, received: ${JSON.stringify(a)}`
		);
	}

	return an.toString(2);
});

async function emit(
	rootDir: string,
	codeEmit: CodeEmitJsonSpec,
	codeEmitData: CodeEmitData
): Promise<FileToWrite[]> {
	const { preEmit } = codeEmit;

	if (preEmit) {
		const preEmitPath = path.resolve(rootDir, preEmit);
		const preEmitModule = require(preEmitPath);
		// the module may be commonjs or esm
		const preEmitFn = preEmitModule.default ?? preEmitModule;
		codeEmitData = await preEmitFn(rootDir, codeEmitData);
	}

	return codeEmit.inputs.map<FileToWrite>((codeEmit) => {
		const templatePath = path.resolve(rootDir, codeEmit.template);
		try {
			const templateSrc = fs.readFileSync(templatePath).toString();
			const template = Handlebars.compile(templateSrc, { noEscape: true });

			const code = template(codeEmitData);

			return {
				path: path.resolve(rootDir, codeEmit.dest),
				contents: Buffer.from(code),
			};
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			throw new Error(`code emit error for ${templatePath}: ${message}`);
		}
	});
}

export { emit };
