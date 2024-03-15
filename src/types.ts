import * as t from 'io-ts';
import { Canvas } from 'canvas';
import { Palette16Bit } from './api/palette/types';
import { CodeEmitCromAnimationGroup } from './generators/cromAnimations';
import { CodeEmitSromImage } from './generators/sromImages';
import { CodeEmitTileset } from './generators/tilesets';
import { CodeEmitCromImage } from './generators/cromImages';

// these don't use io-ts as they are not part of the input
export type CodeEmitData = {
	palettes: Palette16Bit[];
	sromImages: CodeEmitSromImage[];
	tilesets: CodeEmitTileset[];
	cromImages: CodeEmitCromImage[];
	cromAnimations: CodeEmitCromAnimationGroup[];
};

export type FileToWrite = {
	path: string;
	contents: Buffer;
};

export type BaseTile = {
	/**
	 * the modern png source for this tile,
	 */
	canvasSource: Canvas;

	/**
	 * The sixteen bit palette that got assigned to this source.
	 * The source will use this to figure out how to convert into
	 * the indexed format
	 */
	palette?: Palette16Bit;

	/**
	 * If set, determines whether this palette should be included into the emitted
	 * palette data. If not set the default is true.
	 *
	 * This is used by the eyecatcher as those images use predefined palettes already on the system
	 */
	emitPalette?: boolean;

	/**
	 * If true, when matching from 24 bit color to palette index, a conversion ignoring the dark bit
	 * will be used. Not used in normal situations, but used by eyecatcher tiles
	 */
	paletteIgnoresDarkBit?: boolean;

	/**
	 * Which palette this is in the final 16bit palette array output
	 */
	paletteIndex?: number;

	duplicateOf?: BaseTile;
};

// keep the hand written types as comments since I am new to io-ts

// type CodeEmit = {
// 	preEmit?: string;
// 	inputs: Array<{
// 		template: string;
// 		dest: string;
// 	}>;
// };
const CodeEmitJsonSpec = t.intersection([
	t.partial({
		preEmit: t.union([t.string, t.null, t.undefined]),
	}),
	t.type({
		inputs: t.array(
			t.type({
				template: t.string,
				dest: t.string,
			})
		),
	}),
]);
export type CodeEmitJsonSpec = t.TypeOf<typeof CodeEmitJsonSpec>;

// type EyeCatcherJsonSpec = {
// 	mainLogoImageFile: string;
// 	max330MegaImageFile?: string;
// 	proGearSpecImageFile?: string;
// 	snkLogoImageFile?: string;
// 	copyrightCharacter?: string;
// };
const EyeCatcherJsonSpec = t.intersection([
	t.type({
		mainLogoImageFile: t.string,
	}),
	t.partial({
		max330MegaImageFile: t.union([t.string, t.null, t.undefined]),
		proGearSpecImageFile: t.union([t.string, t.null, t.undefined]),
		snkLogoImageFile: t.union([t.string, t.null, t.undefined]),
		copyrightCharacterImageFile: t.union([t.string, t.null, t.undefined]),
	}),
]);
export type EyeCatcherJsonSpec = t.TypeOf<typeof EyeCatcherJsonSpec>;

// type SromImageInput = {
// 	name: string;
// 	imageFile: string;
// };
const SromImageInput = t.type({
	name: t.string,
	imageFile: t.string,
	startingIndex: t.union([t.number, t.null, t.undefined]),
});
export type SromImageInput = t.TypeOf<typeof SromImageInput>;

const SromImagesJsonSpec = t.array(SromImageInput);
export type SromImagesJsonSpec = t.TypeOf<typeof SromImagesJsonSpec>;

// type TilesetInput = {
// 	name: string;
// 	imageFile: string;
//  autoAnimation?: 4 | 8;
// };
const TilesetInput = t.intersection([
	t.type({
		name: t.string,
		imageFile: t.string,
	}),
	t.partial({
		autoAnimation: t.union([t.literal(4), t.literal(8), t.null, t.undefined]),
	}),
	t.UnknownRecord,
]);
export type TilesetInput = t.TypeOf<typeof TilesetInput>;

const TilesetsJsonSpec = t.array(TilesetInput);
export type TilesetsJsonSpec = t.TypeOf<typeof TilesetsJsonSpec>;

// type CromImageInput = {
// 	name: string;
// 	imageFile: string;
// 	autoAnimation?: 4 | 8;
// 	[key: string]: unknown;
// };
const CromImageInput = t.intersection([
	t.type({
		name: t.string,
		imageFile: t.string,
	}),
	t.partial({
		autoAnimation: t.union([t.literal(4), t.literal(8), t.null, t.undefined]),
	}),
	t.UnknownRecord,
]);
export type CromImageInput = t.TypeOf<typeof CromImageInput>;

const CromImagesInputJsonSpec = t.array(CromImageInput);
export type CromImagesInputJsonSpec = t.TypeOf<typeof CromImagesInputJsonSpec>;

// type CromAnimation = {
// 	name: string;
// 	imageFile: string;
// 	tileWidth?: number;
// 	durations?: number;
// 	[key: string]: unknown;
// };
const CromAnimation = t.intersection([
	t.type({
		name: t.string,
		imageFile: t.string,
	}),
	t.partial({
		tileWidth: t.union([t.number, t.null, t.undefined]),
		duration: t.union([t.number, t.null, t.undefined]),
	}),
	t.UnknownRecord,
]);
export type CromAnimation = t.TypeOf<typeof CromAnimation>;

// type CromAnimationInput = {
// 	name: string;
// 	animations: CromAnimation[];
// };
const CromAnimationInput = t.type({
	name: t.string,
	animations: t.array(CromAnimation),
});
export type CromAnimationInput = t.TypeOf<typeof CromAnimationInput>;

const CromAnimationsInputJsonSpec = t.array(CromAnimationInput);
export type CromAnimationsInputJsonSpec = t.TypeOf<
	typeof CromAnimationsInputJsonSpec
>;

// type JsonInput = {
// 	romPathRoot: string;
// 	padCROMFilesTo?: number;
//  codeEmit?: CodeEmitSpec;
// 	eyecatcher?: EyeCatcherJsonSpec;
// 	sromImages?: SromImagesJsonSpec;
// 	tilesets?: TilesetsJsonSpec;
// 	cromImages?: CromImagesInputJsonSpec;
// 	cromAnimations?: CromAnimationsInputJsonSpec;
// };
export const JsonInput = t.intersection([
	t.type({
		romPathRoot: t.string,
	}),
	t.partial({
		padCROMFilesTo: t.union([t.number, t.null, t.undefined]),
		codeEmit: t.union([CodeEmitJsonSpec, t.null, t.undefined]),
		eyecatcher: t.union([EyeCatcherJsonSpec, t.null, t.undefined]),
		sromImages: t.union([SromImagesJsonSpec, t.null, t.undefined]),
		tilesets: t.union([TilesetsJsonSpec, t.null, t.undefined]),
		cromImages: t.union([CromImagesInputJsonSpec, t.null, t.undefined]),
		cromAnimations: t.union([CromAnimationsInputJsonSpec, t.null, t.undefined]),
	}),
]);
export type JsonInput = t.TypeOf<typeof JsonInput>;
