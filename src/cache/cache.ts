import * as vscode from 'vscode';
import WorkSpaceCache from './workSpaceCache';
import { StyleObject } from '../typings';

export default class Cache {
    private static styleCache = {};

    public static buildCache (diagnosticCollection) {
        if (vscode.workspace.workspaceFolders) {
            vscode.workspace.workspaceFolders.map(item => {
                Cache.styleCache[item.uri.fsPath] = new WorkSpaceCache(item, diagnosticCollection)
            })
        }
    }

    public static buildWorkSpaceCache(item: vscode.WorkspaceFolder, diagnosticCollection) {
        Cache.deleteWorkSpaceCache(item);
        Cache.styleCache[item.uri.fsPath] = new WorkSpaceCache(item, diagnosticCollection);
    }

    public static deleteWorkSpaceCache(item: vscode.WorkspaceFolder) {
        if (Cache.styleCache[item.uri.fsPath] != null) {
            Cache.styleCache[item.uri.fsPath].dispose();
            delete Cache.styleCache[item.uri.fsPath];
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

    public static getJsPathByStyleFile(uri: vscode.Uri) : string[] {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        const wsc: WorkSpaceCache = Cache.styleCache[workspaceFolder.uri.fsPath];
        if (wsc == null) {
            return null;
        }
        return wsc.getJsPathByStyleFile(uri.fsPath);
    }

    public static getWorkSpaceCache(uri: vscode.Uri): StyleObject {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        return Cache.styleCache[workspaceFolder.uri.fsPath];
    }
}