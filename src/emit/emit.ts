import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { CodeEmit, FileToWrite } from "../types";

Handlebars.registerHelper('p', function(a: unknown) {
    return String(a);
});

Handlebars.registerHelper('flat', function(a: unknown) {
    if (!Array.isArray(a)) {
        throw new Error('flat: argument is not an array');
    }
    return a.flat(Infinity);
});

function emit(rootDir: string, codeEmit: CodeEmit | null | undefined, renderData: Record<string, unknown>): FileToWrite[] {
    return (codeEmit?.inputs ?? []).map<FileToWrite>((codeEmit) => {
        const templatePath = path.resolve(rootDir, codeEmit.template);
        const templateSrc = fs.readFileSync(templatePath).toString();
        const template = Handlebars.compile(templateSrc, { noEscape: true });

        const code = template(renderData);

        return {
            path: path.resolve(rootDir, codeEmit.dest),
            contents: Buffer.from(code)
        }
    });
}

export { emit }