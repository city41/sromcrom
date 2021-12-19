import fs from 'fs';
import { FileToWrite } from './types';

function writeFiles(files: FileToWrite[]) {
	files.forEach((fileToWrite) => {
		fs.writeFileSync(fileToWrite.path, fileToWrite.contents);
		console.log('wrote', fileToWrite.path);
	});
}

export { writeFiles };
