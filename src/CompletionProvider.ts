import * as vscode from 'vscode';
import findImportObjects from './findImportObjects';
import * as path from 'path';
import * as fs from 'fs';
import processLess from './less/processLess';

function getWordBeforeDot(document, dotPosition) {
    let word = null;

    const start = new vscode.Position(dotPosition.line, dotPosition.character - 1);
    const end = new vscode.Position(dotPosition.line, dotPosition.character);
    const charBeforeRange = document.getText(new vscode.Range(start, end));

    // if is dot, we get the preview word and at least current dotPosition.character >= 2.
    if (charBeforeRange === '.' && dotPosition.character >= 2) {
        const posiontBeforeDot = new vscode.Position(dotPosition.line, dotPosition.character - 2);
        const range = document.getWordRangeAtPosition(posiontBeforeDot);
        if (range) {
            word = document.getText(new vscode.Range(range.start, range.end));
        };
    }
    return word;
}

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

        const moduleSpecifier = findImportObjects(document.getText(), identifier);

        if (moduleSpecifier == null) {
            return [];
        }

        const uri = path.join(path.dirname(document.fileName), moduleSpecifier);
        if (fs.existsSync(uri)) {
            const source = fs.readFileSync(uri, 'utf-8');
            const rootPath = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(document.fileName)).uri.fsPath;
            const locals = await processLess(source, rootPath, document.fileName);
            const handlers = [];
            Object.keys(locals).map(key => {
                handlers.push({
                    label: key,
                    kind: vscode.CompletionItemKind.Reference,
                    detail: key,
                    // TODO: show source css/less/sacc code about key here
                    documentation: '',
                });
            })
            return handlers;
        }
        return [];
    }
}
