import { BLACK24 } from '../../palette/colors';
import { getTestCanvas } from '../../../testUtil';
import { denormalizeDupes } from '../denormalizeDupes';

describe('denormalizeDupes', function () {
	it('should maintain the original Canvas ref', function () {
		const tile = {
			cromIndex: 0,
			canvasSource: getTestCanvas(BLACK24),
		};

		const deduped = denormalizeDupes([[[tile]]], 'cromIndex');

		expect(tile).not.toBe(deduped[0][0][0]);
		expect(tile.canvasSource).toBe(deduped[0][0][0].canvasSource);
	});
});
