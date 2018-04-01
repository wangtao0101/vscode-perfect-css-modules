import * as vscode from 'vscode';
import { findMatchModuleSpecifier } from './util/findImportObject';
import * as path from 'path';
import * as fs from 'fs';
import { SourceMapConsumer } from 'source-map';
import processLess from './less/processLess';
import getWordBeforeDot from './util/getWordBeforeDot';
import Cache from './cache/cache';
import { StyleObject } from './typings';

export default class CompletionProvider implements vscode.CompletionItemProvider {
    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position,
        token: vscode.CancellationToken): Promise<vscode.CompletionItem[]> {
        let identifier = null;
        let wordToComplete = '';
        const range = document.getWordRangeAtPosition(position);
        if (range) {
            wordToComplete = document.getText(new vscode.Range(range.start, range.end));
            // the range should be after dot, so we find dot.
            identifier = getWordBeforeDot(document, range.start);
        } else {
            // there is no word under cursor, so we check whether the preview word is dot.
            identifier = getWordBeforeDot(document, position);
        }

        if (identifier == null) {
            return [];
        }

        const moduleSpecifier = findMatchModuleSpecifier(document.getText(), identifier);

        if (moduleSpecifier == null) {
            return [];
        }

        const uri = path.join(path.dirname(document.fileName), moduleSpecifier);
        const style: StyleObject = Cache.getStyleObject(vscode.Uri.file(uri));

        if (style != null) {
            const locals = style.locals;
            const handlers = [];
            Object.keys(locals).map(key => {
                handlers.push({
                    label: key,
                    kind: vscode.CompletionItemKind.Reference,
                    detail: key,
                    documentation: locals[key].name,
                });
            })
            return handlers;
        }
        return [];
    }
}
