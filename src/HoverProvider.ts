import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import getWordBeforeDot from './util/getWordBeforeDot';
import { findMatchModuleSpecifier } from './util/findImportObject';
import processLess from './less/processLess';
import { StyleObject, Local } from './typings';
import Cache from './cache/cache';

export default class CSSModuleHoverProvider implements vscode.HoverProvider {
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<vscode.Hover> {
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
      const moduleSpecifier = findMatchModuleSpecifier(document.getText(), identifier);

      if (moduleSpecifier == null) {
        return null;
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
        });
        if (matchLocal != null) {
          return new vscode.Hover(matchLocal.name);
        }
      }
    }
  }
}
