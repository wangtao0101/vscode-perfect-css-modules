import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import getWordBeforeDot from './util/getWordBeforeDot';
import findImportObjects from './util/findImportObjects';
import processLess from "./less/processLess";
import Cache from "./cache";
import { StyleObject, Local } from './typings';

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
                const locals = style.locals;
                let matchLocal: Local = null;
                Object.keys(locals).map(key => {
                    if (key === wordToDefinition) {
                        matchLocal = locals[key];
                    }
                })
                if (matchLocal != null) {
                    const position = [];
                    let start;
                    let end;
                    if (matchLocal.positions.length === 0) {
                        start = new vscode.Position(0, 0);
                        end = new vscode.Position(0, 1);
                        position.push(new vscode.Location(vscode.Uri.file(uri), new vscode.Range(start, end)))
                    } else {
                        matchLocal.positions.map(po => {
                            start = new vscode.Position(po.line, po.column);
                            end = new vscode.Position(po.line, po.column + matchLocal.name.length);
                            position.push(new vscode.Location(vscode.Uri.file(po.source), new vscode.Range(start, end)))
                        })
                    }
                    return position;
                }
            }
            return null;
        }

    }
}
