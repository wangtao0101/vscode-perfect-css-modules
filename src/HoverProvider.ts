import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import getWordBeforeDot from './util/getWordBeforeDot';
import findImportObjects from "./findImportObjects";
import processLess from "./less/processLess";

export default class CSSModuleHoverProvider implements vscode.HoverProvider {
    public async provideHover(document: vscode.TextDocument, position: vscode.Position,
        token: vscode.CancellationToken): Promise<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position);
        if (range == null) {
            return null;
        }
        const wordToDefinition = document.getText(new vscode.Range(range.start, range.end));
        const identifier = getWordBeforeDot(document, range.start);

        if (identifier == null) {
            // just a word
        } else {
            // find xxx.abc

            const moduleSpecifier = findImportObjects(document.getText(), identifier);

            if (moduleSpecifier == null) {
                return null;
            }

            const uri = path.join(path.dirname(document.fileName), moduleSpecifier);
            if (fs.existsSync(uri)) {
                const source = fs.readFileSync(uri, 'utf-8');
                const rootPath = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(document.fileName)).uri.fsPath;
                const locals = await processLess(source, rootPath, document.fileName);
                let isFind = false;
                Object.keys(locals).map(key => {
                    if (key === wordToDefinition) {
                        isFind = true;
                    }
                })
                if (isFind) {
                    return new vscode.Hover(source);
                }
            }
            return null;
        }

    }
}
