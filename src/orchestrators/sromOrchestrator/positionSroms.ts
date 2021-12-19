import { SROMTile } from '../../api/srom/types';
import { Json } from '../../types';
import { GeneratorWithSROMTiles } from './types';

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
	json: Json,
	inputs: GeneratorWithSROMTiles[]
) {
	inputs.forEach((input) => {
		if (input.generator.setSROMPositions) {
			input.generator.setSROMPositions(rootDir, json, input.tiles);
		}
	});

	const allTiles = inputs.reduce<SROMTile[]>((building, input) => {
		return building.concat(input.tiles.flat(2));
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

	// we start at 33 as it seems eyecatcher sometimes uses tiles from 0-32
	// TODO: investigate this
	let curAnywhereIndex = 33;

	while (canGoAnywhere.length > 0) {
		while (alreadyUsedIndices.has(curAnywhereIndex)) {
			++curAnywhereIndex;
		}

		const tile = canGoAnywhere.pop();
		tile!.sromIndex = curAnywhereIndex++;
	}
}

export { positionSroms };
