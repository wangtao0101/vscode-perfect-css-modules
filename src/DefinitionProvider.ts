import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import getWordBeforeDot from './util/getWordBeforeDot';
import { findMatchModuleSpecifier } from './util/findImportObject';
import processLess from './less/processLess';
import Cache from './cache/cache';
import { StyleObject, Local } from './typings';
import getVueLanguageRegions from './util/vueLanguageRegions';
import { getStringAttr } from './util/help';

export default class CSSModuleDefinitionProvider implements vscode.DefinitionProvider {
  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<vscode.Definition> {
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

      if (document.languageId === 'vue' && identifier === '$style') {
        return await this.provideVueDefinition(wordToDefinition, document, position);
      }

      const moduleSpecifier = findMatchModuleSpecifier(document.getText(), identifier);

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
        });
        if (matchLocal != null) {
          const position = [];
          let start;
          let end;
          if (matchLocal.positions.length === 0) {
            start = new vscode.Position(0, 0);
            end = new vscode.Position(0, 1);
            position.push(new vscode.Location(vscode.Uri.file(uri), new vscode.Range(start, end)));
          } else {
            matchLocal.positions.map(po => {
              // TODO: check the word in file for $ if less file
              start = new vscode.Position(po.line, po.column);
              end = new vscode.Position(po.line, po.column + matchLocal.name.length);
              position.push(new vscode.Location(vscode.Uri.file(po.fsPath), new vscode.Range(start, end)));
            });
          }
          return position;
        }
      }
      return null;
    }
  }

  private async provideVueDefinition(
    word: string,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Definition> {
    const regions = getVueLanguageRegions(document.getText()).getAllStyleRegions();
    const items = [];
    for (const region of regions) {
      const start = new vscode.Position(region.start.line, region.start.character);
      const end = new vscode.Position(region.end.line, region.end.character);
      const sourceRange = new vscode.Range(start, end);
      const workspace = vscode.workspace.getWorkspaceFolder(document.uri);
      const result = await processLess(
        document.getText(sourceRange),
        workspace.uri.fsPath,
        document.uri.fsPath,
        true,
        getStringAttr('modulesPath', document.uri),
      );
      if (result) {
        items.push(...this.generateItemFromLocal(result.locals, word, document.uri, region.start.line));
      }
    }
    return items;
  }

  private generateItemFromLocal(locals, word, uri, lineGap) {
    const items = [];
    Object.keys(locals).map(key => {
      if (key === word) {
        const matchLocal = locals[key];
        let start;
        let end;
        if (matchLocal.positions.length === 0) {
          start = new vscode.Position(0, 0);
          end = new vscode.Position(0, 1);
          items.push(new vscode.Location(vscode.Uri.file(uri), new vscode.Range(start, end)));
        } else {
          matchLocal.positions.map(po => {
            const line = po.fsPath.endsWith('vue') ? po.line + lineGap : po.line;
            // TODO: check the word in file for $ if less file
            start = new vscode.Position(line, po.column);
            end = new vscode.Position(line, po.column + matchLocal.name.length);
            items.push(new vscode.Location(vscode.Uri.file(po.fsPath), new vscode.Range(start, end)));
          });
        }
      }
    });
    return items;
  }
}
