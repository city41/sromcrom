function getPadding(len: number): number[] {
	const padding = new Array(len).fill(0, 0, len);
	return padding;
}

export function padTo(data: number[], targetSize: number): number[] {
	const paddingSize = targetSize - data.length;

	if (paddingSize < 0) {
		throw new Error('padTo: asked to pad something but it is too big');
	}

	const padding = getPadding(paddingSize);

	return data.concat(padding);
}
