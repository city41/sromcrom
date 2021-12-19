import { CROMTile } from '../api/crom/types';
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

function positionCroms(inputs: GeneratorWithCROMTiles[]) {
	inputs.forEach((input) => {
		if (input.generator.setCROMPositions) {
			input.generator.setCROMPositions(input.tiles);
		}
	});

	const allTiles = inputs.reduce<CROMTile[]>((building, input) => {
		return building.concat(input.tiles.flat(2));
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

	while (
		mustGoOnEights.length > 0 ||
		mustGoOnFours.length > 0 ||
		canGoAnywhere.length > 0
	) {
		if (curIndex % 8 === 0 && mustGoOnEights.length > 0) {
			const tile = mustGoOnEights.pop();
			tile!.cromIndex = curIndex++;

			for (let c = 0; c < tile!.childAnimationFrames!.length; ++c) {
				tile!.childAnimationFrames![c].cromIndex = curIndex++;
			}
		} else if (curIndex % 4 === 0 && mustGoOnFours.length > 0) {
			const tile = mustGoOnFours.pop();
			tile!.cromIndex = curIndex++;

			for (let c = 0; c < tile!.childAnimationFrames!.length; ++c) {
				tile!.childAnimationFrames![c].cromIndex = curIndex++;
			}
		} else if (canGoAnywhere.length > 0) {
			const tile = canGoAnywhere.pop();
			tile!.cromIndex = curIndex++;
		}
	}

	if (canGoAnywhere.length !== 0) {
		throw new Error(
			'positionCroms: left while loop before depleting canGoAnywhere'
		);
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
