import parseImport, { ImportDeclaration } from 'parse-import-es6';
import * as path from 'path';
import { StyleImport } from '../typings';

const isStyle = /\.(less|css)$/;

function getIdentifier(imp: ImportDeclaration) {
    // namespace import is priority before default import
    if (imp.nameSpaceImport) {
        return imp.nameSpaceImport.split('as')[1].trim();
    }
    return imp.importedDefaultBinding;
}

function getFilterImports(source: string) {
    const imports = parseImport(source);
    // should have default import or namespace import, like:
    // import a from 'xxx.less'
    // import * as a from 'xxx.less'
    const filteredImports = imports.filter(
        imp =>
            imp.error === 0
            && isStyle.test(imp.moduleSpecifier)
            && (imp.importedDefaultBinding != null || imp.nameSpaceImport != null));
    return filteredImports;
}

export function findMatchModuleSpecifier(source: string, identifier: string) {
    const filteredImports = getFilterImports(source);
    let result = null;
    filteredImports.some(imp => {
        const tempi = getIdentifier(imp);
        if (identifier === tempi) {
            result = imp.moduleSpecifier;
            return true;
        }
    });
    return result;
}

export function findAllStyleImports(source: string, fsPath: string) : Array<StyleImport>{
    const filteredImports = getFilterImports(source);
    return filteredImports.map(imp => {
        const identifier = getIdentifier(imp);
        return {
            identifier,
            jsFsPath: fsPath,
            styleFsPath: path.join(path.dirname(fsPath), imp.moduleSpecifier),
        }
    })
}