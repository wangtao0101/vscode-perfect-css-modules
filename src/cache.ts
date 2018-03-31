import * as vscode from 'vscode';
import WorkSpaceCache from './workSpaceCache';
import { StyleObject } from './typings';

export default class Cache {
    private static styleCache = {};

    public static buildCache () {
        if (vscode.workspace.workspaceFolders) {
            vscode.workspace.workspaceFolders.map(item => {
                Cache.styleCache[item.uri.fsPath] = new WorkSpaceCache(item)
            })
        }
    }

    /**
     * get parsed style file objcet
     * @param uri file URI
     */
    public static getStyleObject(uri: vscode.Uri) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        const wsc: WorkSpaceCache = Cache.styleCache[workspaceFolder.uri.fsPath];
        if (wsc == null) {
            return null;
        }
        return wsc.getStyleObject(uri.fsPath);
    }

    public static getWorkSpaceCache(uri: vscode.Uri): StyleObject {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        return Cache.styleCache[workspaceFolder.uri.fsPath];
    }
}