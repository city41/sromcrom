import { Canvas } from 'canvas';

export function isCanvasBlank(canvas: Canvas): boolean {
	const data = canvas
		.getContext('2d')
		.getImageData(0, 0, canvas.width, canvas.height).data;

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] === 255) {
			return false;
		}
	}

	return true;
}
