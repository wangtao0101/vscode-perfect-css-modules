import * as vscode from 'vscode';
import CompletionProvider from './CompletionProvider';
import CSSModuleDefinitionProvider from './DefinitionProvider';
import CSSModuleHoverProvider from './HoverProvider';
import Cache from './cache/cache';
import ReferenceProvider from './ReferenceProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('perfect-css-moules extension is now active!');

    const mode: vscode.DocumentFilter[] = [
        { language: "javascript", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
        { language: "typescript", scheme: "file" },
        { language: "typescriptreact", scheme: "file" },
        { language: "vue", scheme: "file" },
    ];

    const stylemode: vscode.DocumentFilter[] = [
        { language: "css", scheme: "file" },
        { language: "less", scheme: "file" },
    ];

    const completetion = vscode.languages.registerCompletionItemProvider(mode, new CompletionProvider(), '.');
    const definition = vscode.languages.registerDefinitionProvider(mode, new CSSModuleDefinitionProvider());
    const hover = vscode.languages.registerHoverProvider(mode, new CSSModuleHoverProvider());
    const reference = vscode.languages.registerReferenceProvider(stylemode, new ReferenceProvider());
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('perfect-css-modules');

    Cache.buildCache(diagnosticCollection);

    const wfWatcher = vscode.workspace.onDidChangeWorkspaceFolders((event) => {
        event.added.map(item => {
            Cache.buildWorkSpaceCache(item, diagnosticCollection)
        })
        event.removed.map(item => {
            Cache.deleteWorkSpaceCache(item)
        });
    })

    context.subscriptions.push(diagnosticCollection, wfWatcher, completetion, definition, hover);
}

export function deactivate() {
}
