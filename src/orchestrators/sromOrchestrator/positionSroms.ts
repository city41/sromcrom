import { SROMTile } from '../../api/srom/types';
import { JsonInput } from '../../types';
import { GeneratorWithSROMSourceResults } from './types';

function sortBySromIndex(a: SROMTile, b: SROMTile): number {
	if (a.sromIndex === undefined && b.sromIndex === undefined) {
		return 0;
	}

	if (a.sromIndex !== undefined && b.sromIndex === undefined) {
		return -1;
	}

	if (b.sromIndex !== undefined && a.sromIndex === undefined) {
		return 1;
	}

	return a.sromIndex! - b.sromIndex!;
}

function positionSroms(
	rootDir: string,
	json: JsonInput,
	inputs: GeneratorWithSROMSourceResults[]
) {
	inputs.forEach((input) => {
		if (input.generator.setSROMPositions) {
			input.generator.setSROMPositions(
				rootDir,
				json[input.generator.jsonKey as keyof JsonInput],
				input.sromSourceResults
			);
		}
	});

	const allTiles = inputs.reduce<SROMTile[]>((building, input) => {
		const actualTiles = input.sromSourceResults
			.map((ssr) => ssr.tiles)
			.flat(3)
			.filter((t) => t !== null) as SROMTile[];
		return building.concat(actualTiles);
	}, []);

	const sortedTiles = allTiles.sort(sortBySromIndex);

	const canGoAnywhere = allTiles.filter(
		(t) => t.sromIndex === undefined && !t.duplicateOf
	);

	const alreadyPositioned = sortedTiles.filter(
		(t) => t.sromIndex !== undefined
	);
	const alreadyUsedIndices = new Set<number>(
		alreadyPositioned.map((t) => t.sromIndex!)
	);

	while (canGoAnywhere.length > 0) {
		let openIndex = 0;
		while (alreadyUsedIndices.has(openIndex)) {
			openIndex += 1;
		}

		const tile = canGoAnywhere.shift();
		tile!.sromIndex = openIndex;
		alreadyUsedIndices.add(openIndex);
	}
}

export { positionSroms };
