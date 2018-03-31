import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import getWordBeforeDot from './util/getWordBeforeDot';
import findImportObjects from './util/findImportObjects';
import processLess from './less/processLess';
import { StyleObject } from './typings';
import Cache from './cache';

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
            const style: StyleObject = Cache.getStyleObject(vscode.Uri.file(uri));

            if (style != null) {
                const locals = style.locals;
                let isFind = false;
                Object.keys(locals).map(key => {
                    if (key === wordToDefinition) {
                        isFind = true;
                    }
                })
                if (isFind) {
                    return new vscode.Hover(style.source);
                }
            }
            return null;
        }

    }
}
