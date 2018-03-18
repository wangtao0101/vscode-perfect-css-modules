const cssLoader = require('css-loader');
const less = require('less');
import { SourceMapConsumer } from 'source-map';

function runLoader(loader, input, map, addOptions, callback) {
    var opt = {
        options: {
            context: ""
        },
        callback: callback,
        async: function () {
            return callback;
        },
        loaders: [{ request: "/path/css-loader" }],
        loaderIndex: 0,
        context: "",
        resource: "test.css",
        resourcePath: "test.css",
        request: "css-loader!test.css",
        emitError: function (message) {
            throw new Error(message);
        }
    };
    Object.keys(addOptions).forEach(function (key) {
        opt[key] = addOptions[key];
    });
    loader.call(opt, input, map);
}

function removeImportfromSouce(source: string) {
    const first = source.indexOf('\n');
    const second = source.indexOf('\n', first + 1);
    const third = source.indexOf('\n', second + 1);
    return source.substring(third + 1, source.length);
}

function processCss(source) {
    runLoader(cssLoader, source, undefined, {
        query: '?module&localIdentName=_[local]_'
    }, function (err, output) {
        try {
            const text = removeImportfromSouce(output);

            const pushFaker = []
            const exportsFaker = {
                push: (s) => pushFaker.push(s),
                locals: {},
            }
            const moduleFaker = {
                id: 1,
            }
            const requireFaker = function(){}
            const context = new Function('exports', 'module', 'require', text);
            context(exportsFaker, moduleFaker, requireFaker);
            const locals = exportsFaker.locals;
            console.log(locals);
        } catch (error) {
            console.log(error);
        }
    });
}

function processLess(source, callback) {
    less.render(source,  {sourceMap: { outputSourceFiles: true}})
    .then((output) => {
        console.log(output)
        console.log(JSON.parse(output.map))
        callback(output.css, JSON.parse(output.map));
    }).catch((err) => {
        console.error(err);
    });
}

export async function process() {
//     const source =
//         `   /*
//     * a ' above
//     */

//    .bg {
//      background-image: url(bg.jpg);
//    }

//    /*
//     * a ' below
//     */
// `
//    processCss(source);

    const sources = `
    /*
     * comment
     */

     .a {
         .b {
             color: #ffffff;
         }
     }

     // Variables
@my-selector: banner;

// Usage
.@{my-selector} {
  font-weight: bold;
  line-height: 40px;
  margin: 0 auto;
}
`
    const callback = async (css, sourceMap) => {
        sourceMap.sources = ['test.css'];

        // const consumer = await new SourceMapConsumer(sourceMap);
        // consumer.eachMapping(function (m) { console.log(m); })
        processCss(css);
    }

    processLess(sources, callback);
}

// 在css文件中 找.xxxx 定位位置，在less中不行，因为有可能xxx在less中是一个变量，此时xxx在css中是一定会出现的，可以通过sourcemap找到css和less文件的对应