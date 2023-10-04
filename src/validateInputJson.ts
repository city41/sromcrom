import { isLeft } from 'fp-ts/lib/Either';
import { report } from 'io-ts-human-reporter';
import { JsonInput } from './types';

function validateInputJson(rawJson: unknown): rawJson is JsonInput {
	const decoded = JsonInput.decode(rawJson);

	if (isLeft(decoded)) {
		throw new Error(
			`Input is incorrect:\n\t${report(decoded).join('\n\t')}\n\n`
		);
	}

	return true;
}

export { validateInputJson };
