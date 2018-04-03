import * as path from "path";
import { compile as JavascriptCompiler } from "./javascript";
import { compile as TypescriptCompiler } from "./typescript";
import { PropertyAccessExpression, StyleImport } from "../typings";

export function compile(code: string, filepath: string, styleImports: StyleImport[]): PropertyAccessExpression[] {
  switch (path.extname(filepath)) {
    case ".js":
    case ".jsx":
    case ".mjs":
      return JavascriptCompiler(code, filepath, styleImports);
    case ".ts":
    case ".tsx":
      return TypescriptCompiler(code, filepath, styleImports);
    default:
      return [];
  }
}