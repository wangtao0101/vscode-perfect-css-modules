export interface Position {
  line: number; // 0-based
  column: number; // 0-based
  fsPath: string; // fsPath
}

export interface Local {
  name: string; // original name
  positions: Array<Position>;
}

export interface StyleObject {
  locals: Map<string, Local>;
  css: string;
  source: string;
}

export interface StyleImport {
  identifier: string;
  jsFsPath: string;
  styleFsPath: string;
}

export interface PropertyAccessExpression {
  left: string;
  right: string;
  pos: number;
  end: number;
  styleImport: StyleImport;
}
