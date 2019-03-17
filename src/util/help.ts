import * as vscode from 'vscode';

export function getStringAttr(name: string, uri: vscode.Uri) {
  return vscode.workspace.getConfiguration('perfect-css-modules', uri).get<string>(name);
}
