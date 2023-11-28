import { ISROMGenerator, SROMSourceResult } from '../../api/srom/types';

export type GeneratorWithSROMSourceResults = {
	generator: ISROMGenerator;
	sromSourceResults: SROMSourceResult[];
};
