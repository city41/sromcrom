import { Mock } from 'ts-mockery';
import { markDupes } from '../markDupes';
import type { BaseTile } from '../markDupes';

describe('markDupes', function () {
	it('should mark two tiles as dupes if the comparator returns true', function () {
		const tiles: BaseTile[] = [Mock.of<BaseTile>(), Mock.of<BaseTile>()];

		markDupes(tiles, () => true);

		expect(tiles[0].duplicateOf).toBe(undefined);
		expect(tiles[1].duplicateOf).toBe(tiles[0]);
	});
});
