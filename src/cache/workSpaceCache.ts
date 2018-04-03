import { WorkspaceFolder, RelativePattern, FileSystemWatcher } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as pify from 'pify';
import processLess from '../less/processLess';
import processCss from '../css/processCss';
import { StyleImport, StyleObject } from '../typings';
import { findAllStyleImports } from '../util/findImportObject';
import { compile } from '../parse/typescript';

const vfile = require('vfile');
const vfileLocation = require('vfile-location');

const readFile = pify(fs.readFile.bind(fs));

const isLess = /\.less$/;
const isCss = /\.css$/;

export default class WorkSpaceCache {
    private fileWatcher: Array<FileSystemWatcher> = [];
    private workspaceFolder: WorkspaceFolder;
    private styleCache = {};
    private styleImportsCache: Map<string, StyleImport[]> = new Map();
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

        this.init();
    }

    private async init() {
        await this.processAllStyleFiles();
        this.processAllJsFiles();
        this.addFileWatcher();
    }

    private addFileWatcher() {
        const relativePattern = new RelativePattern(path.join(this.workspaceFolder.uri.fsPath, this.rootDir), this.styleFilesToScan);
        const styleWatcher = vscode.workspace.createFileSystemWatcher(relativePattern);
        styleWatcher.onDidChange((file: vscode.Uri) => {
            this.processStyleFile(file);
            this.regenerateDiagnostic(file.fsPath);
        })
        styleWatcher.onDidCreate((file: vscode.Uri) => {
            this.processStyleFile(file);
            this.regenerateDiagnostic(file.fsPath);
        })
        styleWatcher.onDidDelete((file: vscode.Uri) => {
            delete this.styleCache[file.fsPath];
        })

        const relativePatternJs = new RelativePattern(path.join(this.workspaceFolder.uri.fsPath, this.rootDir), this.jsFilesToScan);
        const jsWatcher = vscode.workspace.createFileSystemWatcher(relativePatternJs);
        jsWatcher.onDidChange((file: vscode.Uri) => {
            const data = fs.readFileSync(file.fsPath);
            this.processJsFile(file);
        })
        jsWatcher.onDidCreate((file: vscode.Uri) => {
            this.processJsFile(file);
        })
        jsWatcher.onDidDelete((file: vscode.Uri) => {
            delete this.styleImportsCache[file.fsPath];
            this.diagnosticCollection.delete(file);
        })
        this.fileWatcher.push(styleWatcher);
        this.fileWatcher.push(jsWatcher);
    }

    private async processAllStyleFiles() {
        const relativePattern = new RelativePattern(path.join(this.workspaceFolder.uri.fsPath, this.rootDir), this.styleFilesToScan);
        const files = await vscode.workspace.findFiles(relativePattern, '{**/node_modules/**}', 99999);
        for (const file of files) {
            await this.processStyleFile(file);
        }
    }

    /**
     * regenerate Diagnostic after change style file
     * @param styleFilePath
     */
    private regenerateDiagnostic(styleFilePath: string) {
        const relatedJsFilePaths = [];
        Object.keys(this.styleImportsCache).map(jsPath => {
            const sis:StyleImport[] = this.styleImportsCache[jsPath];
            sis.map(si => {
                if (si.styleFsPath === styleFilePath) {
                    relatedJsFilePaths.push(si.jsFsPath);
                }
            })
        })
        relatedJsFilePaths.map(jsPath => {
            this.processJsFile(vscode.Uri.file(jsPath));
        })
    }

    private async processStyleFile(file: vscode.Uri) {
        try {
            const data = await readFile(file.fsPath, 'utf8')
            if (file.fsPath.match(isLess)) {
                const result = await processLess(data, this.workspaceFolder.uri.fsPath, file.fsPath, this.camelCase);
                this.styleCache[file.fsPath] = result;
            } else if (file.fsPath.match(isCss)) {
                const result = await processCss(data, file.fsPath, this.camelCase)
                this.styleCache[file.fsPath] = result;
            }
        } catch (error) {
            console.log(error);
        }
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
            const styleImports = findAllStyleImports(data, file.fsPath);
            this.styleImportsCache[file.fsPath] = styleImports;

            this.diagnosticCollection.delete(file);
            if (styleImports.length !== 0) {
                const diags: Array<vscode.Diagnostic> = [];
                const paes = compile(data, file.fsPath, styleImports);
                const location = vfileLocation(vfile(data));
                paes.map(pae => {
                    const styleObject = this.getStyleObject(pae.styleImport.styleFsPath)
                    if (styleObject != null && styleObject.locals[pae.right] == null) {
                        /**
                         * range {
                         *   line: 1-based
                         *   column: 1-based
                         * }
                         */
                        const rangeStart = location.toPosition(pae.pos); // offset: 0-based
                        const rangeEnd = location.toPosition(pae.end); // offset: 0-based
                        const vsRange = new vscode.Range(rangeStart.line - 1, rangeStart.column - 1, rangeEnd.line - 1, rangeEnd.column - 1);
                        diags.push(new vscode.Diagnostic(vsRange, `perfect-css-module: Cannot find ${pae.right} in ${pae.left}.`, vscode.DiagnosticSeverity.Error));
                    }
                })
                if (diags.length !== 0) {
                    this.diagnosticCollection.set(file, diags);
                }
            }
        })
    }

    public getStyleObject(fsPath: string): StyleObject {
        return this.styleCache[fsPath];
    }

    public dispose() {
        this.fileWatcher.map(fw => {
            fw.dispose();
        })
    }
}