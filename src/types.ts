import * as t from 'io-ts';

// keep the hand written types as comments since I am new to io-ts

// type CodeEmit = {
// 	preEmit?: string;
// 	inputs: Array<{
// 		template: string;
// 		dest: string;
// 	}>;
// };
const CodeEmit = t.intersection([
	t.partial({
		preEmit: t.union([t.string, t.null, t.undefined])
	}),
	t.type({
		inputs: t.array(t.type({
			template: t.string,
			dest: t.string
		}))
	})
]);
export type CodeEmit = t.TypeOf<typeof CodeEmit>;

// this does not use io-ts as it's not part of the input
export type FileToWrite = {
	path: string;
	contents: Buffer;
};

// type PalettesSpec = {
	// codeEmit?: CodeEmit;
// };
const PalettesSpec = t.partial({
	codeEmit: t.union([CodeEmit, t.null, t.undefined])
});
export type PalettesSpec = t.TypeOf<typeof PalettesSpec>;


// type EyeCatcherJsonSpec = {
// 	mainLogoImageFile: string;
// 	max330MegaImageFile?: string;
// 	proGearSpecImageFile?: string;
// 	snkLogoImageFile?: string;
// 	copyrightCharacter?: string;
// };
const EyeCatcherJsonSpec = t.intersection([
	t.type({
		mainLogoImageFile: t.string
	}),
	t.partial({
		max330MegaImageFile: t.union([t.string, t.null, t.undefined]),
		proGearSpecImageFile: t.union([t.string, t.null, t.undefined]),
		snkLogoImageFile: t.union([t.string, t.null, t.undefined]),
		copyrightCharacterImageFile: t.union([t.string, t.null, t.undefined])
	}),
]);
export type EyeCatcherJsonSpec = t.TypeOf<typeof EyeCatcherJsonSpec>;

// type SromImageInput = {
// 	name: string;
// 	imageFile: string;
// };
const SromImageInput = t.type({
	name: t.string,
	imageFile: t.string
});
export type SromImageInput = t.TypeOf<typeof SromImageInput>;

// type SromImagesJsonSpec = {
// 	codeEmit?: CodeEmit;
// 	inputs: SromImageInput[];
// };
const SromImagesJsonSpec = t.intersection([
	t.partial({
		codeEmit: t.union([CodeEmit, t.null, t.undefined])
	}),
	t.type({
		inputs: t.array(SromImageInput)
	})
]);
export type SromImagesJsonSpec = t.TypeOf<typeof SromImagesJsonSpec>;

// type TilesetInput = {
// 	name: string;
// 	imageFile: string;
// };
const TilesetInput = t.type({
	name: t.string,
	imageFile: t.string
});
export type TilesetInput = t.TypeOf<typeof TilesetInput>;

// type TilesetsJsonSpec = {
// 	codeEmit?: CodeEmit;
// 	inputs: TilesetInput[];
// };
const TilesetsJsonSpec = t.intersection([
	t.partial({
		codeEmit: t.union([CodeEmit, t.null, t.undefined])
	}),
	t.type({
		inputs: t.array(TilesetInput)
	})
]);
export type TilesetsJsonSpec = t.TypeOf<typeof TilesetsJsonSpec>;

// type CromImageInput = {
// 	name: string;
// 	imageFile: string;
// 	tileWidth?: number;
// 	autoAnimation?: number;
// 	[key: string]: unknown;
// };
const CromImageInput = t.intersection([
	t.type({
		name: t.string,
		imageFile: t.string
	}),
	t.partial({
		tileWidth: t.union([t.number, t.null, t.undefined]),
		autoAnimation: t.union([t.number, t.null, t.undefined]),
	}),
	t.UnknownRecord
]);
export type CromImageInput = t.TypeOf<typeof CromImageInput>;

// type CromImagesInputJsonSpec = {
// 	codeEmit?: CodeEmit;
// 	inputs: CromImageInput[];
// };
const CromImagesInputJsonSpec = t.intersection([
	t.partial({
		codeEmit: t.union([CodeEmit, t.null, t.undefined])
	}),
	t.type({
		inputs: t.array(CromImageInput)
	})
]);
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
		imageFile: t.string
	}),
	t.partial({
		tileWidth: t.union([t.number, t.null, t.undefined]),
		duration: t.union([t.number, t.null, t.undefined]),
	}),
	t.UnknownRecord
]);
export type CromAnimation = t.TypeOf<typeof CromAnimation>;

// type CromAnimationInput = {
// 	name: string;
// 	animations: CromAnimation[];
// };
const CromAnimationInput = t.type({
	name: t.string,
	animations: t.array(CromAnimation)
});
export type CromAnimationInput = t.TypeOf<typeof CromAnimationInput>;

// type CromAnimationInputJsonSpec = {
// 	codeEmit?: CodeEmit;
// 	inputs: CromAnimationInput[];
// };
const CromAnimationsInputJsonSpec = t.intersection([
	t.partial({
		codeEmit: t.union([CodeEmit, t.null, t.undefined])
	}),
	t.type({
		inputs: t.array(CromAnimationInput)
	})
]);
export type CromAnimationsInputJsonSpec = t.TypeOf<typeof CromAnimationsInputJsonSpec>;

// type JsonInput = {
// 	romPathRoot: string;
//  templateEngine?: 'handlebars' | 'ejs';
// 	padCROMFilesTo?: number;
// 	palettes?: PalettesSpec;
// 	eyecatcher?: EyeCatcherJsonSpec;
// 	sromImages?: SromImagesJsonSpec;
// 	tilesets?: TilesetsJsonSpec;
// 	cromImages?: CromImagesInputJsonSpec;
// 	cromAnimations?: CromAnimationsInputJsonSpec;
// };
export const JsonInput = t.intersection([
	t.type({
		romPathRoot: t.string
	}),
	t.partial({
		templateEngine: t.union([t.literal('handlebars'), t.literal('ejs'), t.null, t.undefined]),
		padCROMFilesTo: t.union([t.number, t.null, t.undefined]),
		palettes: t.union([PalettesSpec, t.null, t.undefined]),
		eyecatcher: t.union([EyeCatcherJsonSpec, t.null, t.undefined]),
		sromImages: t.union([SromImagesJsonSpec, t.null, t.undefined]),
		tilesets: t.union([TilesetsJsonSpec, t.null, t.undefined]),
		cromImages: t.union([CromImagesInputJsonSpec, t.null, t.undefined]),
		cromAnimations: t.union([CromAnimationsInputJsonSpec, t.null, t.undefined]),
	})
]);
export type JsonInput = t.TypeOf<typeof JsonInput>;
