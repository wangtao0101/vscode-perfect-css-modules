'use strict';
import * as vscode from 'vscode';
import CompletionProvider from './CompletionProvider';
import DefinitionProvider from './DefinitionProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "test" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    const mode: vscode.DocumentFilter[] = [
        { language: "javascript", scheme: "file" },
        { language: "typescript", scheme: "file" },
        { language: "typescriptreact", scheme: "file" },
        { language: "typescriptreact", scheme: "file" },
    ];

    const completetion = vscode.languages.registerCompletionItemProvider(mode, new CompletionProvider(), '.');
    const definition = vscode.languages.registerDefinitionProvider(mode, new DefinitionProvider())

    context.subscriptions.push(disposable, completetion, definition);
}

// this method is called when your extension is deactivated
export function deactivate() {
}