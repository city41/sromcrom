export type CodeEmit = {
	template: string;
	dest: string;
};

export type FileToWrite = {
	path: string;
	contents: Buffer;
};

export type Json = Record<string, unknown>;
