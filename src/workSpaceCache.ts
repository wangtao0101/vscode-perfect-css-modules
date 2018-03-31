import { WorkspaceFolder, RelativePattern, FileSystemWatcher } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs';
import processLess from './less/processLess';

const isLess = /\.less$/;
const isCss = /\.css$/;

export default class WorkSpaceCache {
    private fileWatcher: Array<FileSystemWatcher> = [];
    private workspaceFolder: WorkspaceFolder;
    private cache = {};
    private camelCase;

    constructor(workspaceFolder: WorkspaceFolder) {
        this.workspaceFolder = workspaceFolder;
        this.camelCase = vscode.workspace.getConfiguration('perfect-css-modules', this.workspaceFolder.uri).get<string>('camelCase');

        this.processAllStyleFile();
        this.addFileWatcher();
    }

    private addFileWatcher() {
        // TODO: filter file not in src
        const watcher = vscode.workspace.createFileSystemWatcher(new RelativePattern(this.workspaceFolder, '**/*.{less}'));
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

    getStyleObject(fsPath: string) {
        return this.cache[fsPath];
    }

    async processAllStyleFile() {
        // TODO: filter file not in src
        const relativePattern = new RelativePattern(this.workspaceFolder, '**/*.{less}');
        const files = await vscode.workspace.findFiles(relativePattern, '{**/node_modules/**}', 99999);
        files.forEach(file => {
            this.processStyleFile(file);
        });
    }

    processStyleFile(file: vscode.Uri) {
        fs.readFile(file.fsPath, 'utf8', (err, data) => {
            if (err) {
                return console.log(err);
            }
            if (file.fsPath.match(isLess)) {
                processLess(data, this.workspaceFolder.uri.fsPath, file.fsPath, this.camelCase)
                .then(result => {
                    this.cache[file.fsPath] = result;
                })
            }
        })
    }
}