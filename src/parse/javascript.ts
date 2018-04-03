import {
    MemberExpression
    // isIdentifier,
    // isStringLiteral
} from "@babel/types";

import { parse } from "babylon";
import { StyleImport, PropertyAccessExpression } from "../typings";
const traverse = require("@babel/traverse").default;

export function compile(code: string, filepath: string, styleImports: StyleImport[]): PropertyAccessExpression[] {
    const result = [];
    let ast;
    try {
        ast = parse(code, {
            sourceType: "module",
            plugins: [
                "jsx",
                "flow",
                "classConstructorCall",
                "doExpressions",
                "objectRestSpread",
                "decorators",
                "classProperties",
                "exportExtensions",
                "asyncGenerators",
                "functionBind",
                "functionSent",
                "dynamicImport"
            ]
        });
    } catch (err) {
        return void 0;
    }

    const visitor: any = {
        MemberExpression(object) {
            const left = object.node.object.name;
            const property = object.node.property;
            const matchStyleImport = styleImports.find(si => si.identifier === left)
            if (matchStyleImport != null) {
                result.push({
                    left,
                    right: property.name,
                    pos: property.start,
                    end: property.end,
                    styleImport: matchStyleImport
                })
            }
        }
    };

    traverse(ast, visitor);

    return result;
}