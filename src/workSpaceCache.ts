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

    constructor(workspaceFolder: WorkspaceFolder) {
        this.workspaceFolder = workspaceFolder;
        this.processALLStyleFile();
    }

    async processALLStyleFile() {
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
                processLess(data, this.workspaceFolder.uri.fsPath, file.fsPath)
                .then(result => {
                    this.cache[file.fsPath] = result;
                })
            }
        })
    }
}