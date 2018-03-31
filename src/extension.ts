import * as vscode from 'vscode';
import CompletionProvider from './CompletionProvider';
import CSSModuleDefinitionProvider from './DefinitionProvider';
import CSSModuleHoverProvider from './HoverProvider';
import Cache from './cache/cache';

export function activate(context: vscode.ExtensionContext) {
    console.log('perfect-css-moules extension is now active!');

    const mode: vscode.DocumentFilter[] = [
        { language: "javascript", scheme: "file" },
        { language: "typescript", scheme: "file" },
        { language: "typescriptreact", scheme: "file" },
        { language: "typescriptreact", scheme: "file" },
    ];

    const completetion = vscode.languages.registerCompletionItemProvider(mode, new CompletionProvider(), '.');
    const definition = vscode.languages.registerDefinitionProvider(mode, new CSSModuleDefinitionProvider())
    const hover = vscode.languages.registerHoverProvider(mode, new CSSModuleHoverProvider())

    Cache.buildCache();

    const wfWatcher = vscode.workspace.onDidChangeWorkspaceFolders((event) => {
        event.added.map(item => {
            Cache.buildWorkSpaceCache(item)
        })
        event.removed.map(item => {
            Cache.deleteWorkSpaceCache(item)
        });
    })

    context.subscriptions.push(wfWatcher, completetion, definition, hover);
}

export function deactivate() {
}