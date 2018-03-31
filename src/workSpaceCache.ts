import { WorkspaceFolder, RelativePattern, FileSystemWatcher } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs';
import processLess from './less/processLess';
import processCss from './css/processCss';

const isLess = /\.less$/;
const isCss = /\.css$/;

export default class WorkSpaceCache {
    private fileWatcher: Array<FileSystemWatcher> = [];
    private workspaceFolder: WorkspaceFolder;
    private cache = {};
    private camelCase;
    private filesToScan;

    constructor(workspaceFolder: WorkspaceFolder) {
        this.workspaceFolder = workspaceFolder;
        this.camelCase = vscode.workspace.getConfiguration('perfect-css-modules', this.workspaceFolder.uri).get<string>('camelCase');
        this.filesToScan = vscode.workspace.getConfiguration('perfect-css-modules', this.workspaceFolder.uri).get<string>('filesToScan');

        this.processAllStyleFile();
        this.addFileWatcher();
    }

    private addFileWatcher() {
        const watcher = vscode.workspace.createFileSystemWatcher(new RelativePattern(this.workspaceFolder, this.filesToScan));
        watcher.onDidChange((file: vscode.Uri) => {
            this.processStyleFile(file);
        })
        watcher.onDidCreate((file: vscode.Uri) => {
            this.processStyleFile(file);
        })
        watcher.onDidDelete((file: vscode.Uri) => {
            delete this.cache[file.fsPath];
        })
        this.fileWatcher.push(watcher);
    }

    private async processAllStyleFile() {
        const relativePattern = new RelativePattern(this.workspaceFolder, this.filesToScan);
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
                    this.cache[file.fsPath] = result;
                })
            } else if (file.fsPath.match(isCss)) {
                processCss(data, file.fsPath, this.camelCase)
                .then(result => {
                    this.cache[file.fsPath] = result;
                })
            }
        })
    }

    public getStyleObject(fsPath: string) {
        return this.cache[fsPath];
    }

    public dispose() {
        this.fileWatcher.map(fw => {
            fw.dispose();
        })
    }
}