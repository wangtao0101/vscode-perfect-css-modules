import * as ts from "typescript";
import { StyleImport, PropertyAccessExpression } from "../typings";

export function compile(code: string, filepath: string, styleImports: Array<StyleImport>) : Array<PropertyAccessExpression>{
    const result = [];
    let sourceFile;
    try {
        sourceFile = ts.createSourceFile(
            "test.ts",
            code,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX
        );
    } catch (err) {
        return void 0;
    }

    function doParse(SourceFile: ts.SourceFile) {
        doParseNode(SourceFile);

        function doParseNode(node: ts.Node) {
            switch (node.kind) {
                case ts.SyntaxKind.PropertyAccessExpression:
                    const left = (node as ts.PropertyAccessExpression).expression.getText();
                    const name = (node as ts.PropertyAccessExpression).name;
                    const matchStyleImport = styleImports.find(si => si.identifier === left)
                    if (matchStyleImport != null) {
                        result.push({
                            left,
                            right: name.getText(),
                            pos: name.pos,
                            end: name.end,
                            styleImport: matchStyleImport
                        })
                    }
                    break;
            }

            ts.forEachChild(node, doParseNode);
        }
    }

    doParse(sourceFile);

    return result;
}