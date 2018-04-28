import * as vscode from 'vscode';
import { StyleObject } from './typings';
import Cache from './cache/cache';

export default class ReferenceProvider implements vscode.ReferenceProvider {
    public async provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext,
        token: vscode.CancellationToken): Promise<vscode.Location[]> {
        const range = document.getWordRangeAtPosition(position);
        if (range) {
            let word = document.getText(new vscode.Range(range.start, range.end));
            if (word.startsWith('.')) {
                word = word.substring(1);
            }
            const style: StyleObject = Cache.getStyleObject(document.uri);
            if (style == null) {
                return []
            }
            const name = Object.keys(style.locals).find(local => style.locals[local].name === word);
            if (name == null) {
                return [];
            }
            console.log(name);
            const jsPaths = Cache.getJsPathByStyleFile(document.uri);
            console.log(jsPaths);
        }
        return [];
    }
}