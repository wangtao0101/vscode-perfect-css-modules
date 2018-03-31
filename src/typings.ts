export interface Local {
    name: string; // original name
    positions: Array<{
        line: number; // 0-based
        column: number; // 0-based
        source: string; // fsPath
    }>
}

export interface StyleObject {
    locals: Map<string, Local>;
    css: string;
    source: string;
}