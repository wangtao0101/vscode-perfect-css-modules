import * as vscode from 'vscode';

/**
 * get word before dot
 * @param document
 * @param dotPosition the position after dot, just like the position of d. (abc.d)
 * @returns if before d is not dot or there is no word then return null, otherwise return the word
 */
export default function getWordBeforeDot(document, dotPosition) {
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