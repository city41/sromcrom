import { CROMTile } from '../../api/crom/types';
import { JsonInput } from '../../types';
import { GeneratorWithCROMTiles } from './types';

function sortByCromIndex(a: CROMTile, b: CROMTile): number {
	if (a.cromIndex === undefined && b.cromIndex === undefined) {
		return 0;
	}

	if (a.cromIndex !== undefined && b.cromIndex === undefined) {
		return -1;
	}

	if (b.cromIndex !== undefined && a.cromIndex === undefined) {
		return 1;
	}

	return a.cromIndex! - b.cromIndex!;
}

function positionCroms(
	rootDir: string,
	json: JsonInput,
	inputs: GeneratorWithCROMTiles[]
) {
	inputs.forEach((input) => {
		if (input.generator.setCROMPositions) {
			input.generator.setCROMPositions(rootDir, json, input.tiles);
		}
	});

	const allTiles = inputs.reduce<CROMTile[]>((building, input) => {
		const actualTiles = input.tiles
			.flat(2)
			.filter((t) => t !== null) as CROMTile[];
		return building.concat(actualTiles);
	}, []);

	const canGoAnywhere = allTiles.filter(
		(t) =>
			t.cromIndex === undefined &&
			t.childAnimationFrames === undefined &&
			!t.duplicateOf &&
			!t.childOf
	);
	const mustGoOnFours = allTiles.filter(
		(t) => t.childAnimationFrames?.length === 3
	);
	const mustGoOnEights = allTiles.filter(
		(t) => t.childAnimationFrames?.length === 7
	);

	const sortedTiles = allTiles.sort(sortByCromIndex);
	const allIndicesSoFar: number[] = sortedTiles
		.filter((t) => t.cromIndex !== undefined)
		.map((t) => t.cromIndex) as number[];

	// TODO: this is wrong because it assumes already positioned tiles
	// are contiguous from 0...n. In the case of CROMs that actually is true,
	// but we should still not make that assumption

	let curIndex =
		allIndicesSoFar.length === 0 ? 0 : Math.max(...allIndicesSoFar) + 1;

	while (canGoAnywhere.length > 0) {
		if (curIndex % 8 === 0 && mustGoOnEights.length > 0) {
			const tile = mustGoOnEights.shift();
			tile!.cromIndex = curIndex++;

			for (let c = 0; c < tile!.childAnimationFrames!.length; ++c) {
				tile!.childAnimationFrames![c].cromIndex = curIndex++;
			}
		} else if (curIndex % 4 === 0 && mustGoOnFours.length > 0) {
			const tile = mustGoOnFours.shift();
			tile!.cromIndex = curIndex++;

			for (let c = 0; c < tile!.childAnimationFrames!.length; ++c) {
				tile!.childAnimationFrames![c].cromIndex = curIndex++;
			}
		} else if (canGoAnywhere.length > 0) {
			const tile = canGoAnywhere.shift();
			tile!.cromIndex = curIndex++;
		}
	}

	while (curIndex % 8 !== 0) {
		++curIndex;
	}

	while (mustGoOnEights.length > 0) {
		const tile = mustGoOnEights.pop();
		tile!.cromIndex = curIndex++;

		for (let c = 0; c < tile!.childAnimationFrames!.length; ++c) {
			tile!.childAnimationFrames![c].cromIndex = curIndex++;
		}
	}

	while (mustGoOnFours.length > 0) {
		const tile = mustGoOnFours.pop();
		tile!.cromIndex = curIndex++;

		for (let c = 0; c < tile!.childAnimationFrames!.length; ++c) {
			tile!.childAnimationFrames![c].cromIndex = curIndex++;
		}
	}
}

export { positionCroms };
