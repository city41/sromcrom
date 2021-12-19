export type Color24Bit = [number, number, number, number];
export type Color16Bit = number;

// a palette always has at least one color
export type Palette24Bit = [Color24Bit, ...Color24Bit[]];
export type Palette16Bit = [Color16Bit, ...Color16Bit[]];

export type PaletteIndex =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15;

export type PaletteColorData = {
	raw24ColorToIndex: Map<string, PaletteIndex>;
	paletteIndex: number;
};
