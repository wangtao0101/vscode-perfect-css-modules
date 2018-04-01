import { WorkspaceFolder, RelativePattern, FileSystemWatcher } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import processLess from '../less/processLess';
import processCss from '../css/processCss';
import { StyleImport } from '../typings';
import { findAllStyleImports } from '../util/findImportObject';

const isLess = /\.less$/;
const isCss = /\.css$/;

export default class WorkSpaceCache {
    private fileWatcher: Array<FileSystemWatcher> = [];
    private workspaceFolder: WorkspaceFolder;
    private styleCache = {};
    private styleImportsCache = {};
    private camelCase;
    private styleFilesToScan;
    private jsFilesToScan;
    private rootDir;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(workspaceFolder: WorkspaceFolder, diagnosticCollection: vscode.DiagnosticCollection) {
        this.workspaceFolder = workspaceFolder;
        this.diagnosticCollection = diagnosticCollection;

        this.rootDir = vscode.workspace.getConfiguration('perfect-css-modules', this.workspaceFolder.uri).get<string>('rootDir');
        this.camelCase = vscode.workspace.getConfiguration('perfect-css-modules', this.workspaceFolder.uri).get<string>('camelCase');
        this.styleFilesToScan = vscode.workspace.getConfiguration('perfect-css-modules', this.workspaceFolder.uri).get<string>('styleFilesToScan');
        this.jsFilesToScan = vscode.workspace.getConfiguration('perfect-css-modules', this.workspaceFolder.uri).get<string>('jsFilesToScan');

        this.processAllStyleFiles();
        this.processAllJsFiles();
        this.addFileWatcher();
    }

    private addFileWatcher() {
        const relativePattern = new RelativePattern(path.join(this.workspaceFolder.uri.fsPath, this.rootDir), this.styleFilesToScan);
        const styleWatcher = vscode.workspace.createFileSystemWatcher(relativePattern);
        styleWatcher.onDidChange((file: vscode.Uri) => {
            this.processStyleFile(file);
        })
        styleWatcher.onDidCreate((file: vscode.Uri) => {
            this.processStyleFile(file);
        })
        styleWatcher.onDidDelete((file: vscode.Uri) => {
            delete this.styleCache[file.fsPath];
        })

        const relativePatternJs = new RelativePattern(path.join(this.workspaceFolder.uri.fsPath, this.rootDir), this.jsFilesToScan);
        const jsWatcher = vscode.workspace.createFileSystemWatcher(relativePatternJs);
        jsWatcher.onDidChange((file: vscode.Uri) => {
            this.processJsFile(file);
        })
        jsWatcher.onDidCreate((file: vscode.Uri) => {
            this.processJsFile(file);
        })
        jsWatcher.onDidDelete((file: vscode.Uri) => {
            delete this.styleImportsCache[file.fsPath];
        })
        this.fileWatcher.push(styleWatcher);
        this.fileWatcher.push(jsWatcher);
    }

    private async processAllStyleFiles() {
        const relativePattern = new RelativePattern(path.join(this.workspaceFolder.uri.fsPath, this.rootDir), this.styleFilesToScan);
        const files = await vscode.workspace.findFiles(relativePattern, '{**/node_modules/**}', 99999);
        files.forEach(file => {
            this.processStyleFile(file);
        });
    }

    private processStyleFile(file: vscode.Uri) {
        fs.readFile(file.fsPath, 'utf8', (err, data) => {
            if (err) {
                return console.log(err);
            }
            if (file.fsPath.match(isLess)) {
                processLess(data, this.workspaceFolder.uri.fsPath, file.fsPath, this.camelCase)
                .then(result => {
                    this.styleCache[file.fsPath] = result;
                })
            } else if (file.fsPath.match(isCss)) {
                processCss(data, file.fsPath, this.camelCase)
                .then(result => {
                    this.styleCache[file.fsPath] = result;
                })
            }
        })
    }

    private async processAllJsFiles() {
        const relativePattern = new RelativePattern(path.join(this.workspaceFolder.uri.fsPath, this.rootDir), this.jsFilesToScan);
        const files = await vscode.workspace.findFiles(relativePattern, '{**/node_modules/**}', 99999);
        files.forEach(file => {
            this.processJsFile(file);
        });
    }

    private processJsFile(file: vscode.Uri) {
        fs.readFile(file.fsPath, 'utf8', (err, data) => {
            if (err) {
                return console.log(err);
            }
            this.styleImportsCache[file.fsPath] = findAllStyleImports(data, file.fsPath);
        })
    }

    public getStyleObject(fsPath: string) {
        return this.styleCache[fsPath];
    }

    public dispose() {
        this.fileWatcher.map(fw => {
            fw.dispose();
        })
    }
}