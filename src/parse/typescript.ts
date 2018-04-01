import * as ts from "typescript";

export function compile(code: string, filepath: string, identifers: string[]) {
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
                    if (identifers.indexOf(left) !== -1) {
                        result.push({
                            left,
                            right: name.getText(),
                            pos: name.pos,
                            end: name.end - 1,
                        })
                    }
                    break;
            }

            ts.forEachChild(node, doParseNode);
        }
    }

    doParse(sourceFile);
}