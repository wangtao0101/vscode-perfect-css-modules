import * as path from 'path';
import * as vscode from 'vscode';
import Cache from './cache/cache';
import { StyleObject } from './typings';
import { findMatchModuleSpecifier } from './util/findImportObject';
import getWordBeforeDot from './util/getWordBeforeDot';
import getVueLanguageRegions from './util/vueLanguageRegions';
import processLess from './less/processLess';
import { getStringAttr } from './util/help';

export default class CompletionProvider implements vscode.CompletionItemProvider {
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<vscode.CompletionItem[]> {
    let identifier = null;
    // let wordToComplete = '';
    const range = document.getWordRangeAtPosition(position);
    if (range) {
      // wordToComplete = document.getText(new vscode.Range(range.start, range.end));
      // the range should be after dot, so we find dot.
      identifier = getWordBeforeDot(document, range.start);
    } else {
      // there is no word under cursor, so we check whether the preview word is dot.
      identifier = getWordBeforeDot(document, position);
    }

    if (identifier == null) {
      return [];
    }

    if (document.languageId === 'vue' && identifier === '$style') {
      // TODO: Custom Inject Name
      return await this.provideVueCompletionItems(identifier, document, position);
    }

    const moduleSpecifier = findMatchModuleSpecifier(document.getText(), identifier);

    if (moduleSpecifier == null) {
      return [];
    }

    const uri = path.join(path.dirname(document.fileName), moduleSpecifier);
    const style: StyleObject = Cache.getStyleObject(vscode.Uri.file(uri));

    if (style != null) {
      const locals = style.locals;
      return this.generateItemFromLocal(locals);
    }
    return [];
  }

  private async provideVueCompletionItems(
    identifier: string,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[]> {
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
        items.push(...this.generateItemFromLocal(result.locals));
      }
    }
    return items;
  }

  private generateItemFromLocal(locals) {
    const items = [];
    Object.keys(locals).map(key => {
      items.push({
        label: key,
        kind: vscode.CompletionItemKind.Reference,
        detail: key,
        documentation: locals[key].name,
      });
    });
    return items;
  }
}
