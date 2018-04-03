const less = require('less');
import { SourceMapConsumer } from 'source-map';
import * as path from 'path';
import getLocals from '../util/getLocals';
import LessImportPlugin from './lessImportPlugin';
import { StyleObject, Position } from '../typings';
const vfile = require('vfile');
const vfileLocation = require('vfile-location');

function getOriginalPositions(sourceMapConsumer, className, css: string = '', cssLocation): Array<Position> {
    const positions: Array<Position> = [];
    let offset = 0;
    while (true) {
        // TODO: find exact match word, do not use index of
        offset = css.indexOf(`.${className}`, offset);
        if (offset === -1) {
            break;
        }
        /**
         * range {
         *   line: 1-based
         *   column: 1-based
         * }
         */
        const range = cssLocation.toPosition(offset); // offset: 0-based
        /**
         * sourceRange {
         *   line: 1-based
         *   column: 0-based
         * }
         */
        const sourceRange = sourceMapConsumer.originalPositionFor({
            line: range.line, // line: 1-based
            column: range.column - 1, // column: 0-based
        });
        if (sourceRange.line != null) {
            positions.push({
                line: sourceRange.line - 1, // 0-based
                column: sourceRange.column, // 0-based
                fsPath: sourceRange.source,
            })
        }

        offset += 1;
    }

    return positions;
}

async function addPositoinForLocals(localKeys, css, sourceMap) {
    const locals = {};
    let consumer = null;
    let location = null;
    if (sourceMap != null) {
        location = vfileLocation(vfile(css));
        consumer = await new SourceMapConsumer(sourceMap);
    }
    Object.keys(localKeys).map(key => {
        if (sourceMap != null) {
            const positions = getOriginalPositions(consumer, localKeys[key], css, location);
            locals[key] = {
                name: localKeys[key],
                positions,
            }
        } else {
            locals[key] = {
                name: localKeys[key],
            }
        }
    })
    return locals;
}

export default async function processLess(source, rootPath, filePath, camelCase) {
    try {
        const lessResult = await less.render(source, {
            sourceMap: {
                outputSourceFiles: true
            },
            relativeUrls: true,
            plugins: [LessImportPlugin()],
            rootpath: rootPath,
            filename: filePath,
        });

        const sourceMap = lessResult.map;
        const css = lessResult.css;

        const localKeys = await getLocals(css, camelCase);
        const locals = await addPositoinForLocals(localKeys, css, sourceMap);
        return {
            locals,
            css,
            source,
        }

    } catch (err) {
        console.log(err);
    }
}

// 在css文件中 找.xxxx 定位位置，在less中不行，因为有可能xxx在less中是一个变量，此时xxx在css中是一定会出现的，可以通过sourcemap找到css和less文件的对应