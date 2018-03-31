import parseImport, { ImportDeclaration } from 'parse-import-es6';

export default function findImportObject(source: string, identifier: string) {
    const imports = parseImport(source);

    // should have default import or namespace import, like:
    // import a from 'xxx.less'
    // import * as a from 'xxx.less'
    const filteredImports = imports.filter(
        imp => imp.error === 0 && (imp.importedDefaultBinding != null || imp.nameSpaceImport != null));


    let result = null;
    filteredImports.some(imp => {
        // namespace import is priority before default import
        if (imp.nameSpaceImport) {
            const tempi = imp.nameSpaceImport.split('as')[1].trim();
            if (identifier === tempi) {
                // return the first moduleSpecifier
                result = imp.moduleSpecifier;
                return true;
            }
        }
    });
    return result;
}