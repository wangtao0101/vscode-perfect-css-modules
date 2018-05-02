import getLocals from "../util/getLocals";
import { Position } from "../typings";

const vfile = require('vfile');
const vfileLocation = require('vfile-location');

function getOriginalPositions(className, css: string = '', cssLocation, filePath): Array<Position> {
    const positions: Array<Position> = [];
    let offset = 0;
    while (true) {
        // TODO: find exact match word, do not use index of
        offset = css.indexOf(`.${className}`, offset);
        if (offset === -1) {
            break;
        }

        const tmpchar = css[offset + className.length + 1];
        if(/[a-zA-Z]/.test(tmpchar)) {
            offset += 1;
            continue;
        }
        /**
         * range {
         *   line: 1-based
         *   column: 1-based
         * }
         */
        const range = cssLocation.toPosition(offset); // offset: 0-based
        positions.push({
            line: range.line - 1, // 0-based
            column: range.column - 1, // 0-based
            fsPath: filePath,
        })

        offset += 1;
    }

    return positions;
}

async function addPositoinForLocals(localKeys, css, filePath) {
    const locals = {};
    const location = vfileLocation(vfile(css));
    Object.keys(localKeys).map(key => {
        const positions = getOriginalPositions(localKeys[key], css, location, filePath);
        locals[key] = {
            name: localKeys[key],
            positions,
        }
    })
    return locals;
}

export default async function processCss(source, filePath, camelCase) {
    try {
        const localKeys = await getLocals(source, camelCase);
        const locals = await addPositoinForLocals(localKeys, source, filePath);
        return {
            locals,
            css: source,
            source,
        }
    } catch (error) {
        console.log(error);
    }
}