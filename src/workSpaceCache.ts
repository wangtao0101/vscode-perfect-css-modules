import { WorkspaceFolder, RelativePattern, FileSystemWatcher } from 'vscode';
import * as vscode from 'vscode';

export default class WorkSpaceCache {
    private fileWatcher: Array<FileSystemWatcher> = [];
    public workspaceFolder: WorkspaceFolder;

    constructor(workspaceFolder: WorkspaceFolder) {
        this.workspaceFolder = workspaceFolder;
    }
}