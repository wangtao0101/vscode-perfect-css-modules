import * as vscode from 'vscode';
import WorkSpaceCache from './workSpaceCache';
import { StyleObject, StyleImport } from '../typings';

export default class Cache {
    private static cache = {};

    public static buildCache (diagnosticCollection) {
        if (vscode.workspace.workspaceFolders) {
            vscode.workspace.workspaceFolders.map(item => {
                Cache.cache[item.uri.fsPath] = new WorkSpaceCache(item, diagnosticCollection)
            })
        }
    }

    public static buildWorkSpaceCache(item: vscode.WorkspaceFolder, diagnosticCollection) {
        Cache.deleteWorkSpaceCache(item);
        Cache.cache[item.uri.fsPath] = new WorkSpaceCache(item, diagnosticCollection);
    }

    public static deleteWorkSpaceCache(item: vscode.WorkspaceFolder) {
        if (Cache.cache[item.uri.fsPath] != null) {
            Cache.cache[item.uri.fsPath].dispose();
            delete Cache.cache[item.uri.fsPath];
        }
    }

    /**
     * get parsed style file objcet
     * @param uri file URI
     */
    public static getStyleObject(uri: vscode.Uri) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        const wsc: WorkSpaceCache = Cache.cache[workspaceFolder.uri.fsPath];
        if (wsc == null) {
            return null;
        }
        return wsc.getStyleObject(uri.fsPath);
    }

    public static getStyleImportByStyleFile(uri: vscode.Uri) : StyleImport[] {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        const wsc: WorkSpaceCache = Cache.cache[workspaceFolder.uri.fsPath];
        if (wsc == null) {
            return null;
        }
        return wsc.getStyleImportByStyleFile(uri.fsPath);
    }

    public static getWorkSpaceCache(uri: vscode.Uri): StyleObject {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        return Cache.cache[workspaceFolder.uri.fsPath];
    }
}