function getPadding(len: number, padValue: number): number[] {
	const padding = new Array(len).fill(padValue, 0, len);
	return padding;
}

export function padTo(
	data: number[],
	targetSize: number,
	padValue = 0
): number[] {
	const paddingSize = targetSize - data.length;

	if (paddingSize < 0) {
		throw new Error('padTo: asked to pad something but it is too big');
	}

	const padding = getPadding(paddingSize, padValue);

	return data.concat(padding);
}
