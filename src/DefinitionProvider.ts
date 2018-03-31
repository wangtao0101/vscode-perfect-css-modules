import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import getWordBeforeDot from './util/getWordBeforeDot';
import findImportObjects from './util/findImportObjects';
import processLess from "./less/processLess";
import Cache from "./cache";
import { StyleObject } from "./typings";

export default class CSSModuleDefinitionProvider implements vscode.DefinitionProvider {
    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position,
        token: vscode.CancellationToken): Promise<vscode.Definition> {
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
                return [];
            }

            const uri = path.join(path.dirname(document.fileName), moduleSpecifier);

            const style: StyleObject = Cache.getStyleObject(vscode.Uri.file(uri));

            if (style != null) {
                const source = fs.readFileSync(uri, 'utf-8');
                const locals = style.locals;
                let isFind = false;
                Object.keys(locals).map(key => {
                    if (key === wordToDefinition) {
                        isFind = true;
                    }
                })
                if (isFind) {
                    const start = new vscode.Position(0, 0);
                    const end = new vscode.Position(0, 1);
                    return [
                        new vscode.Location(vscode.Uri.file(uri), new vscode.Range(start, end)),
                    ]
                }
            }
            return null;
        }

    }
}
