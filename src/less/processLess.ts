const less = require('less');
import { SourceMapConsumer } from 'source-map';
import * as path from 'path';
import getLocals from '../getLocals';
import LessImportPlugin from './lessImportPlugin';

export default async function processLess(source, rootPath, filePath) {
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

        // console.log(lessResult)
        // console.log(JSON.parse(lessResult.map))
        const sourceMap = lessResult.map;
        const css = lessResult.css;
        // const consumer = await new SourceMapConsumer(sourceMap);
        // consumer.eachMapping(function (m) { console.log(m); })

        const locals = await getLocals(css);
        return locals;

    } catch (err) {
        console.log(err);
    }
}

// 在css文件中 找.xxxx 定位位置，在less中不行，因为有可能xxx在less中是一个变量，此时xxx在css中是一定会出现的，可以通过sourcemap找到css和less文件的对应