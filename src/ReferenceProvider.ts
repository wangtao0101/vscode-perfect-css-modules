import * as vscode from 'vscode';
import * as fs from 'fs';
import * as pify from 'pify';
import { StyleObject, PropertyAccessExpression, StyleImport } from './typings';
import Cache from './cache/cache';
import { compile } from './parse';

const readFile = pify(fs.readFile.bind(fs));
const vfile = require('vfile');
const vfileLocation = require('vfile-location');

export default class ReferenceProvider implements vscode.ReferenceProvider {
    public async provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext,
        token: vscode.CancellationToken): Promise<vscode.Location[]> {
        // TODO: maybe we should find word use sourcemap for less or sass
        const range = document.getWordRangeAtPosition(position);
        if (range) {
            let word = document.getText(new vscode.Range(range.start, range.end));
            if (word.startsWith('.')) {
                word = word.substring(1);
            }
            const style: StyleObject = Cache.getStyleObject(document.uri);
            if (style == null) {
                return []
            }
            const name = Object.keys(style.locals).find(local => style.locals[local].name === word);
            if (name == null) {
                return [];
            }
            const styleImports: StyleImport[] = Cache.getStyleImportByStyleFile(document.uri);
            const result: vscode.Location[] = [];
            for (const styleImport of styleImports) {
                const data = await readFile(styleImport.jsFsPath, 'utf8');
                const paes: PropertyAccessExpression[] = compile(data, styleImport.jsFsPath, [styleImport]);
                const location = vfileLocation(vfile(data));
                for (const pae of paes) {
                    if (pae.right === name) {
                        const rangeStart = location.toPosition(pae.pos); // offset: 0-based
                        const rangeEnd = location.toPosition(pae.end); // offset: 0-based
                        const vsRange = new vscode.Range(rangeStart.line - 1, rangeStart.column - 1, rangeEnd.line - 1, rangeEnd.column - 1);
                        result.push(new vscode.Location(vscode.Uri.file(pae.styleImport.jsFsPath), vsRange));
                    }
                }
            }
            return result;
        }
        return [];
    }
}